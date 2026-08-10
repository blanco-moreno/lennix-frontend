import { http, HttpResponse } from 'msw'

import {
  DEFAULT_SEED_TASK_ID,
  resolveSeedProjectId,
  resolveSeedSubtaskId,
  resolveSeedTaskId,
  seedAssignedSubtaskListDTO,
  seedDependencyChainDTO,
  seedOrganizationTaskListDTO,
  seedProject,
  seedSubtaskDTO,
  seedSubtaskListDTO,
  seedTaskDTO,
  seedTaskDependencyDTO,
  seedTaskListDTO,
} from '@/tests/fixtures'

/** The fields both activity listings are narrowed and ordered by. */
interface NarrowableRow {
  title: string
  description: string | null
  status: string
  priority: string
  project_id: string
  due_date: string | null
  delay_days: number
  is_blocked: boolean
  created_at: string
}

const PRIORITY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2 }

/**
 * The filters and the sort `GET /v1/tasks` and `GET /v1/tasks/assigned` share.
 *
 * Applied here rather than assumed, because a handler that ignored `?risk=`
 * would answer every question with the full list — and a surface that filtered
 * its page in the browser would still look correct against it.
 */
function narrowTasks<T extends NarrowableRow>(
  rows: T[],
  params: URLSearchParams,
): T[] {
  const search = params.get('search')?.trim().toLowerCase()
  const status = params.get('status')
  const projectId = params.get('project_id')
  const priority = params.get('priority')
  const risk = params.get('risk')
  const blocked = params.get('is_blocked')
  const dueBefore = params.get('due_before')
  const dueAfter = params.get('due_after')
  const sortBy = params.get('sort_by')

  let items = rows
  if (search) {
    items = items.filter((t) =>
      [t.title, t.description].some((field) =>
        field?.toLowerCase().includes(search),
      ),
    )
  }
  if (status) {
    items = items.filter((t) => t.status === status)
  }
  if (projectId) {
    items = items.filter((t) => t.project_id === projectId)
  }
  if (priority) {
    items = items.filter((t) => t.priority === priority)
  }
  if (risk === 'at_risk') {
    // The KPI's predicate, transcribed: delayed OR blocked.
    items = items.filter((t) => t.delay_days > 0 || t.is_blocked)
  }
  if (blocked) {
    items = items.filter((t) => t.is_blocked === (blocked === 'true'))
  }
  if (dueBefore) {
    items = items.filter((t) => t.due_date !== null && t.due_date <= dueBefore)
  }
  if (dueAfter) {
    items = items.filter((t) => t.due_date !== null && t.due_date >= dueAfter)
  }
  if (sortBy) {
    const direction = sortBy.startsWith('-') ? -1 : 1
    const key = sortBy.replace(/^-/, '')
    const compare = (a: T, b: T): number => {
      switch (key) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'due_date':
          return (a.due_date ?? '').localeCompare(b.due_date ?? '')
        case 'priority':
          return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
        case 'delay_days':
          return a.delay_days - b.delay_days
        default:
          return a.created_at.localeCompare(b.created_at)
      }
    }
    items = [...items].sort((a, b) => direction * compare(a, b))
  }
  return items
}

// ── Tasks ──────────────────────────────────────────────

export const createTaskHandler = http.post(
  '*/v1/tasks/projects/:projectId/tasks',
  ({ params }) => {
    const projectId = resolveSeedProjectId(params.projectId)
    return HttpResponse.json(
      seedTaskDTO(DEFAULT_SEED_TASK_ID, {
        project_id: projectId,
        // Re-parenting the fixture has to re-name it too: the pair travels
        // together on the wire, so moving one and not the other would let a
        // surface read a name the id disagrees with.
        project_name: seedProject(projectId).name,
      }),
      { status: 201 },
    )
  },
)

export const listTasksHandler = http.get(
  '*/v1/tasks/projects/:projectId/tasks',
  ({ params }) => {
    return HttpResponse.json(
      seedTaskListDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const listOrganizationTasksHandler = http.get(
  '*/v1/tasks/',
  ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('page_size') ?? '20')

    // The query is the server's job now, so the mock has to do it too — see
    // `listProjectsHandler` for why an unconditional full list would hide a
    // surface that stopped sending its filters.
    let items = narrowTasks(seedOrganizationTaskListDTO(), url.searchParams)
    const assigneeId = url.searchParams.get('assignee_id')
    const overBudget = url.searchParams.get('is_over_budget')
    const critical = url.searchParams.get('is_critical_path')
    if (assigneeId) {
      // A phase matches through its subactivities: the backend's correlated
      // EXISTS, and it lists the phase once however many of them match.
      items = items.filter((t) =>
        t.subtasks.some((subtask) => subtask.assignee_id === assigneeId),
      )
    }
    if (overBudget) {
      items = items.filter((t) => t.is_over_budget === (overBudget === 'true'))
    }
    if (critical) {
      items = items.filter((t) => t.is_critical_path === (critical === 'true'))
    }

    return HttpResponse.json({
      items,
      total: items.length,
      page,
      page_size: pageSize,
      total_pages: 1,
    })
  },
)

/**
 * `GET /v1/tasks/assigned` — the caller's own activities across the portfolio.
 * Must stay registered before `getTaskHandler`, or the `:taskId` handler matches `assigned` first.
 */
export const listAssignedSubtasksHandler = http.get(
  '*/v1/tasks/assigned',
  ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('page_size') ?? '20')

    const items = narrowTasks(seedAssignedSubtaskListDTO(), url.searchParams)

    return HttpResponse.json({
      items,
      total: items.length,
      page,
      page_size: pageSize,
      total_pages: 1,
    })
  },
)

export const getTaskHandler = http.get('*/v1/tasks/:taskId', ({ params }) => {
  return HttpResponse.json(seedTaskDTO(resolveSeedTaskId(params.taskId)))
})

export const updateTaskHandler = http.put(
  '*/v1/tasks/:taskId',
  ({ params }) => {
    return HttpResponse.json(seedTaskDTO(resolveSeedTaskId(params.taskId)))
  },
)

export const deleteTaskHandler = http.delete('*/v1/tasks/:taskId', () => {
  return new HttpResponse(null, { status: 204 })
})

export const updateTaskStatusHandler = http.patch(
  '*/v1/tasks/:taskId/status',
  ({ params }) => {
    return HttpResponse.json(seedTaskDTO(resolveSeedTaskId(params.taskId)))
  },
)

export const updateTaskBudgetHandler = http.patch(
  '*/v1/tasks/:taskId/budget',
  ({ params }) => {
    return HttpResponse.json(seedTaskDTO(resolveSeedTaskId(params.taskId)))
  },
)

/**
 * The direct override, for whoever holds `forceStart.direct`. Empty body, and
 * the answer is the task itself — already unblocked and marked at risk. A
 * `user` has no key here and files a request instead (`./force-start.ts`).
 */
export const forceStartTaskHandler = http.post(
  '*/v1/tasks/:taskId/force-start',
  ({ params }) => {
    const id = resolveSeedTaskId(params.taskId)
    return HttpResponse.json({
      ...seedTaskDTO(id),
      is_blocked: false,
      at_risk: true,
    })
  },
)

export const forceStartSubtaskHandler = http.post(
  '*/v1/tasks/subtasks/:subtaskId/force-start',
  ({ params }) => {
    const id = resolveSeedSubtaskId(params.subtaskId)
    return HttpResponse.json({
      ...seedSubtaskDTO(id),
      is_blocked: false,
      at_risk: true,
    })
  },
)

// ── Subtasks ───────────────────────────────────────────

export const createSubtaskHandler = http.post(
  '*/v1/tasks/:taskId/subtasks',
  ({ params }) => {
    const parentId = resolveSeedTaskId(params.taskId)
    const [first] = seedSubtaskListDTO(parentId)
    return HttpResponse.json({ ...first, parent_id: parentId }, { status: 201 })
  },
)

export const listSubtasksHandler = http.get(
  '*/v1/tasks/:taskId/subtasks',
  ({ params }) => {
    return HttpResponse.json(
      seedSubtaskListDTO(resolveSeedTaskId(params.taskId)),
    )
  },
)

export const getSubtaskHandler = http.get(
  '*/v1/tasks/subtasks/:subtaskId',
  ({ params }) => {
    return HttpResponse.json(
      seedSubtaskDTO(resolveSeedSubtaskId(params.subtaskId)),
    )
  },
)

export const updateSubtaskHandler = http.put(
  '*/v1/tasks/subtasks/:subtaskId',
  ({ params }) => {
    return HttpResponse.json(
      seedSubtaskDTO(resolveSeedSubtaskId(params.subtaskId)),
    )
  },
)

export const deleteSubtaskHandler = http.delete(
  '*/v1/tasks/subtasks/:subtaskId',
  () => {
    return new HttpResponse(null, { status: 204 })
  },
)

export const updateSubtaskProgressHandler = http.patch(
  '*/v1/tasks/subtasks/:subtaskId/progress',
  ({ params }) => {
    return HttpResponse.json(
      seedSubtaskDTO(resolveSeedSubtaskId(params.subtaskId)),
    )
  },
)

export const updateSubtaskStatusHandler = http.patch(
  '*/v1/tasks/subtasks/:subtaskId/status',
  ({ params }) => {
    return HttpResponse.json(
      seedSubtaskDTO(resolveSeedSubtaskId(params.subtaskId)),
    )
  },
)

// ── Dependencies ───────────────────────────────────────

export const createDependencyHandler = http.post(
  '*/v1/tasks/:taskId/dependencies',
  ({ params }) => {
    return HttpResponse.json(
      seedTaskDependencyDTO({ task_id: resolveSeedTaskId(params.taskId) }),
      { status: 201 },
    )
  },
)

export const updateDependencyHandler = http.patch(
  '*/v1/tasks/:taskId/dependencies/:depId',
  async ({ params, request }) => {
    const body = (await request.json()) as {
      relationship_type?: 'FS' | 'SS' | 'FF' | 'SF'
      lag_days?: number
    }
    return HttpResponse.json(
      seedTaskDependencyDTO({
        id: Number(params.depId),
        task_id: resolveSeedTaskId(params.taskId),
        ...(body.relationship_type
          ? { relationship_type: body.relationship_type }
          : {}),
        ...(body.lag_days === undefined ? {} : { lag_days: body.lag_days }),
      }),
    )
  },
)

export const removeDependencyHandler = http.delete(
  '*/v1/tasks/:taskId/dependencies/:depId',
  () => {
    return new HttpResponse(null, { status: 204 })
  },
)

export const getDependencyChainsHandler = http.get(
  '*/v1/tasks/projects/:projectId/dependencies',
  ({ params }) => {
    return HttpResponse.json(
      seedDependencyChainDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const taskHandlers = [
  createTaskHandler,
  listTasksHandler,
  listOrganizationTasksHandler,
  listAssignedSubtasksHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  updateTaskStatusHandler,
  updateTaskBudgetHandler,
  forceStartTaskHandler,
  forceStartSubtaskHandler,
  createSubtaskHandler,
  listSubtasksHandler,
  getSubtaskHandler,
  updateSubtaskHandler,
  deleteSubtaskHandler,
  updateSubtaskProgressHandler,
  updateSubtaskStatusHandler,
  createDependencyHandler,
  updateDependencyHandler,
  removeDependencyHandler,
  getDependencyChainsHandler,
]
