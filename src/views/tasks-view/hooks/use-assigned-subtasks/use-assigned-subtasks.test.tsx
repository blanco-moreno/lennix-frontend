import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { server } from '@/mocks/server'
import { EMPTY_LIST_QUERY_STATE } from '@/router'
import { makeStore } from '@/stores'
import { seedAssignedSubtaskListDTO } from '@/tests/fixtures'

import { toTaskQueryArgs } from '../../task-query'

import { useAssignedSubtasks } from './use-assigned-subtasks'

function wrapper({ children }: { children: ReactNode }) {
  return <Provider store={makeStore()}>{children}</Provider>
}

describe('useAssignedSubtasks', () => {
  it('stays loading through the /me window, then returns the mapped queue', async () => {
    const { result } = renderHook(
      () => useAssignedSubtasks(toTaskQueryArgs(EMPTY_LIST_QUERY_STATE)),
      { wrapper },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const queue = seedAssignedSubtaskListDTO()
    expect(result.current.subtasks).toHaveLength(queue.length)
    expect(result.current.total).toBe(queue.length)
    // Camel-cased, with the context fields the row renders from. The obra is
    // on every row; the phase only on the rows that hang off one, because the
    // queue answers first-level activities too.
    expect(result.current.subtasks.every((row) => row.projectName)).toBe(true)
    expect(
      result.current.subtasks.some((row) => row.parentTitle !== null),
    ).toBe(true)
    expect(result.current.isError).toBe(false)
  })

  it('reports the failure instead of an empty queue', async () => {
    server.use(
      http.get(
        '*/v1/tasks/assigned',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )

    const { result } = renderHook(
      () => useAssignedSubtasks(toTaskQueryArgs(EMPTY_LIST_QUERY_STATE)),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.subtasks).toEqual([])
  })
})
