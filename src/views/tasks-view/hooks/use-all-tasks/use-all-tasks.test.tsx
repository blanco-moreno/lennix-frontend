import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { server } from '@/mocks/server'
import { EMPTY_LIST_QUERY_STATE } from '@/router'
import { makeStore } from '@/stores'
import { seedOrganizationTaskListDTO } from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'

import { toTaskQueryArgs } from '../../task-query'

import { useAllTasks } from './use-all-tasks'

function wrapper({ children }: { children: ReactNode }) {
  return <Provider store={makeStore()}>{children}</Provider>
}

describe('useAllTasks', () => {
  it('stays loading through the /me window, then returns the org page', async () => {
    const { result } = renderHook(
      () => useAllTasks(toTaskQueryArgs(EMPTY_LIST_QUERY_STATE)),
      { wrapper },
    )

    // `me` counts as loading — reporting "done" here rendered an empty list
    // for a beat before the rows replaced it.
    expect(result.current.isLoading).toBe(true)
    expect(result.current.tasks).toEqual([])

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.tasks).toHaveLength(
      seedOrganizationTaskListDTO().length,
    )
    expect(result.current.total).toBe(seedOrganizationTaskListDTO().length)
    // Mapped to the domain shape — the obra name rides the row.
    expect(result.current.tasks[0].projectName).toBeTruthy()
  })

  it('sends the filters and the page to the server with the org id', async () => {
    const queries: URLSearchParams[] = []
    server.use(
      http.get('*/v1/tasks/', ({ request }) => {
        queries.push(new URL(request.url).searchParams)
        return HttpResponse.json({
          items: [],
          total: 0,
          page: 1,
          page_size: 5,
          total_pages: 0,
        })
      }),
    )

    const { result } = renderHook(
      () =>
        useAllTasks(
          toTaskQueryArgs({
            ...EMPTY_LIST_QUERY_STATE,
            page: 2,
            pageSize: 5,
            search: 'Cimentacion',
            status: 'in_progress',
            project: SEED_IDS.PROJECT_TORRE_ID,
            priority: 'high',
            risk: 'at_risk',
          }),
        ),
      { wrapper },
    )

    await waitFor(() => expect(queries.length).toBeGreaterThan(0))
    const q = queries[0]
    expect(q.get('organization_id')).toBe(SEED_IDS.ORG_LENNIX_ID)
    expect(q.get('page')).toBe('2')
    expect(q.get('page_size')).toBe('5')
    expect(q.get('search')).toBe('Cimentacion')
    expect(q.get('status')).toBe('in_progress')
    expect(q.get('project_id')).toBe(SEED_IDS.PROJECT_TORRE_ID)
    expect(q.get('priority')).toBe('high')
    expect(q.get('risk')).toBe('at_risk')
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
})
