import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  DEFAULT_SEED_PROJECT_ID,
  seedCostReportDTO,
  seedCriticalPathSummaryDTO,
  seedProjectBudgetDTO,
  seedProjectDetailDTO,
  seedProjectExpenseListDTO,
} from '@/tests/fixtures'

import { analyticsApi } from '../analytics/analytics-service'
import { expenseApi } from '../expense/expense-service'
import { projectApi } from '../project/project-service'

import { subtaskApi } from './subtask-service'
import { taskApi } from './task-service'

const PROJECT_A = 'b0000000-0000-000a-0000-000000000000'
const PROJECT_B = 'b0000000-0000-000b-0000-000000000000'
const TASK_ID = 'c0000000-0001-0001-0000-000000000000'
const SUBTASK_ID = 'd0000000-0001-0001-0000-000000000000'

type Store = ReturnType<typeof makeStore>

/**
 * Counts requests per URL so a test can assert both directions of the scoped
 * invalidation: that the deleted item's own project refetches, and that an
 * unrelated project does not.
 */
function countRequests() {
  const counts: Record<string, number> = {}
  const bump = (key: string) => {
    counts[key] = (counts[key] ?? 0) + 1
  }
  server.use(
    http.get(
      '*/v1/analytics/projects/:projectId/critical-paths',
      ({ params }) => {
        bump(`critical-paths:${params.projectId as string}`)
        return HttpResponse.json(
          seedCriticalPathSummaryDTO(DEFAULT_SEED_PROJECT_ID),
        )
      },
    ),
    http.get('*/v1/projects/:projectId/budget', ({ params }) => {
      bump(`budget:${params.projectId as string}`)
      return HttpResponse.json(seedProjectBudgetDTO(DEFAULT_SEED_PROJECT_ID))
    }),
    http.get('*/v1/expenses/projects/:projectId/cost-report', ({ params }) => {
      bump(`cost-report:${params.projectId as string}`)
      return HttpResponse.json(seedCostReportDTO(DEFAULT_SEED_PROJECT_ID))
    }),
    http.get('*/v1/expenses/projects/:projectId', ({ params }) => {
      bump(`expenses:${params.projectId as string}`)
      return HttpResponse.json(
        seedProjectExpenseListDTO(DEFAULT_SEED_PROJECT_ID),
      )
    }),
    http.get('*/v1/projects/:projectId', ({ params }) => {
      bump(`project:${params.projectId as string}`)
      return HttpResponse.json(seedProjectDetailDTO(DEFAULT_SEED_PROJECT_ID))
    }),
  )
  return counts
}

/** Subscribe to every cache a delete has to bust, for both projects, so an
 *  over- *or* under-scoped tag set shows up as a wrong count. */
async function primeCaches(store: Store) {
  await Promise.all(
    [PROJECT_A, PROJECT_B].flatMap((projectId) => [
      store.dispatch(
        analyticsApi.endpoints.getCriticalPaths.initiate(projectId, {
          subscribe: true,
        }),
      ),
      store.dispatch(
        projectApi.endpoints.getProjectBudget.initiate(projectId, {
          subscribe: true,
        }),
      ),
      store.dispatch(
        projectApi.endpoints.getProject.initiate(projectId, {
          subscribe: true,
        }),
      ),
      store.dispatch(
        expenseApi.endpoints.getCostReport.initiate(projectId, {
          subscribe: true,
        }),
      ),
      store.dispatch(
        expenseApi.endpoints.listProjectExpenses.initiate(
          { projectId },
          { subscribe: true },
        ),
      ),
    ]),
  )
}

const CACHE_KEYS = [
  'critical-paths',
  'budget',
  'cost-report',
  'expenses',
  'project',
] as const

function expectFreshFor(counts: Record<string, number>, projectId: string) {
  for (const key of CACHE_KEYS) {
    expect({ key, count: counts[`${key}:${projectId}`] }).toEqual({
      key,
      count: 2,
    })
  }
}

function expectUntouched(counts: Record<string, number>, projectId: string) {
  for (const key of CACHE_KEYS) {
    expect({ key, count: counts[`${key}:${projectId}`] }).toEqual({
      key,
      count: 1,
    })
  }
}

describe('scoped delete invalidation', () => {
  it('deleteTask busts its own project and leaves other projects alone', async () => {
    const counts = countRequests()
    server.use(
      http.delete(
        '*/v1/tasks/:taskId',
        () => new HttpResponse(null, { status: 204 }),
      ),
    )

    const store = makeStore()
    await primeCaches(store)
    expectUntouched(counts, PROJECT_A)
    expectUntouched(counts, PROJECT_B)

    await store.dispatch(
      taskApi.endpoints.deleteTask.initiate({
        id: TASK_ID,
        projectId: PROJECT_A,
      }),
    )

    // Scoping must not drop any cache a delete has to bust — a missing tag
    // here is a stale-cache bug.
    await vi.waitFor(() => expectFreshFor(counts, PROJECT_A))
    expectUntouched(counts, PROJECT_B)
  })

  it('deleteSubtask busts its own project and leaves other projects alone', async () => {
    const counts = countRequests()
    server.use(
      http.delete(
        '*/v1/tasks/subtasks/:subtaskId',
        () => new HttpResponse(null, { status: 204 }),
      ),
    )

    const store = makeStore()
    await primeCaches(store)
    expectUntouched(counts, PROJECT_A)
    expectUntouched(counts, PROJECT_B)

    await store.dispatch(
      subtaskApi.endpoints.deleteSubtask.initiate({
        id: SUBTASK_ID,
        taskId: TASK_ID,
        projectId: PROJECT_A,
      }),
    )

    await vi.waitFor(() => expectFreshFor(counts, PROJECT_A))
    expectUntouched(counts, PROJECT_B)
  })
})
