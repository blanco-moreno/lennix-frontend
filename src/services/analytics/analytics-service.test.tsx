import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  DEFAULT_SEED_PROJECT_ID,
  seedCriticalPathSummaryDTO,
  seedTaskDTO,
} from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'

import { taskApi } from '../task/task-service'

import { analyticsApi, useGetCriticalPathsQuery } from './analytics-service'

const PROJECT_ID = DEFAULT_SEED_PROJECT_ID
const TASK_ID = SEED_IDS.P1_TASK_FOUNDATION

function setup() {
  const store = makeStore()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return { store, wrapper }
}

describe('useGetCriticalPathsQuery', () => {
  it('fetches the critical path summary and maps the response', async () => {
    const { wrapper } = setup()

    const { result } = renderHook(() => useGetCriticalPathsQuery(PROJECT_ID), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.totalCriticalPaths).toBeGreaterThan(0)
    expect(result.current.data?.criticalPaths[0].projectId).toBe(PROJECT_ID)
  })
})

describe('CriticalPath cache invalidation', () => {
  function setupCriticalPathCounter() {
    let fetchCount = 0
    server.use(
      http.get('*/v1/analytics/projects/:projectId/critical-paths', () => {
        fetchCount++
        return HttpResponse.json(seedCriticalPathSummaryDTO(PROJECT_ID))
      }),
    )
    return () => fetchCount
  }

  it('refetches after refreshCriticalPaths mutation', async () => {
    const getCount = setupCriticalPathCounter()
    server.use(
      http.post(
        '*/v1/analytics/projects/:projectId/critical-paths/refresh',
        () => HttpResponse.json(seedCriticalPathSummaryDTO(PROJECT_ID)),
      ),
    )

    const { store, wrapper } = setup()

    const { result } = renderHook(() => useGetCriticalPathsQuery(PROJECT_ID), {
      wrapper,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getCount()).toBe(1)

    await store.dispatch(
      analyticsApi.endpoints.refreshCriticalPaths.initiate(PROJECT_ID),
    )

    await waitFor(() => expect(getCount()).toBe(2))
  })

  it('refetches after a task is updated (cross-domain invalidation)', async () => {
    const getCount = setupCriticalPathCounter()
    // Make sure the PUT response carries the same projectId so the
    // CriticalPath tag invalidation, which is scoped by projectId, fires.
    server.use(
      http.put('*/v1/tasks/:taskId', () =>
        HttpResponse.json(seedTaskDTO(TASK_ID, { project_id: PROJECT_ID })),
      ),
    )

    const { store, wrapper } = setup()

    const { result } = renderHook(() => useGetCriticalPathsQuery(PROJECT_ID), {
      wrapper,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getCount()).toBe(1)

    await store.dispatch(
      taskApi.endpoints.updateTask.initiate({
        id: TASK_ID,
        body: { title: 'Updated by test' },
      }),
    )

    await waitFor(() => expect(getCount()).toBe(2))
  })

  it('refetches after a task status change', async () => {
    const getCount = setupCriticalPathCounter()
    server.use(
      http.patch('*/v1/tasks/:taskId/status', () =>
        HttpResponse.json(seedTaskDTO(TASK_ID, { project_id: PROJECT_ID })),
      ),
    )

    const { store, wrapper } = setup()

    const { result } = renderHook(() => useGetCriticalPathsQuery(PROJECT_ID), {
      wrapper,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getCount()).toBe(1)

    await store.dispatch(
      taskApi.endpoints.updateTaskStatus.initiate({
        id: TASK_ID,
        body: { status: 'done' },
      }),
    )

    await waitFor(() => expect(getCount()).toBe(2))
  })
})
