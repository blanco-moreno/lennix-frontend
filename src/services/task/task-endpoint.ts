import type { TaskPriority, TaskRiskFilter, TaskSortBy } from '@/types'
import type {
  TaskCreateRequestDTO,
  TaskUpdateRequestDTO,
  TaskStatusUpdateRequestDTO,
  TaskBudgetUpdateRequestDTO,
} from '@/types/dto/task-dto'

export const listProjectTasks = (projectId: string) =>
  `/v1/tasks/projects/${projectId}/tasks?include_drafts=false`

/**
 * The cross-project activity list.
 *
 * Every filter is sent to the server so the list and its paginator answer the
 * same question — filtering a fetched page in the browser would search only 20
 * of what may be ~500 activities. Built with `URLSearchParams` for the reason
 * `listProjectsPaginated` gives: too many optional parameters to glue by hand.
 *
 * `assigneeId` narrows to phases holding at least one live subactivity assigned
 * to that person — the phase is listed once however many of its subactivities
 * match.
 */
export const listOrganizationTasks = ({
  organizationId,
  page = 1,
  pageSize = 20,
  search,
  status,
  projectId,
  priority,
  assigneeId,
  risk,
  isBlocked,
  isOverBudget,
  isCriticalPath,
  dueBefore,
  dueAfter,
  includeDrafts,
  sortBy,
}: {
  organizationId: string
  page?: number
  pageSize?: number
  search?: string
  status?: string
  projectId?: string
  priority?: TaskPriority | 'all'
  assigneeId?: string
  risk?: TaskRiskFilter
  isBlocked?: boolean
  isOverBudget?: boolean
  isCriticalPath?: boolean
  /** `YYYY-MM-DD`. An activity with no due date matches neither bound. */
  dueBefore?: string
  dueAfter?: string
  includeDrafts?: boolean
  sortBy?: TaskSortBy
}) => {
  const params = new URLSearchParams({
    organization_id: organizationId,
    page: String(page),
    page_size: String(pageSize),
  })
  // An empty box and a cleared select are not filters — see
  // `listProjectsPaginated`, which omits them for the same reason. The booleans
  // are tri-state: omitting one is what asks for both sides.
  if (search?.trim()) {
    params.set('search', search.trim())
  }
  if (status && status !== 'all') {
    params.set('status', status)
  }
  if (projectId && projectId !== 'all') {
    params.set('project_id', projectId)
  }
  if (priority && priority !== 'all') {
    params.set('priority', priority)
  }
  if (assigneeId && assigneeId !== 'all') {
    params.set('assignee_id', assigneeId)
  }
  if (risk) {
    params.set('risk', risk)
  }
  if (isBlocked !== undefined) {
    params.set('is_blocked', String(isBlocked))
  }
  if (isOverBudget !== undefined) {
    params.set('is_over_budget', String(isOverBudget))
  }
  if (isCriticalPath !== undefined) {
    params.set('is_critical_path', String(isCriticalPath))
  }
  if (dueBefore) {
    params.set('due_before', dueBefore)
  }
  if (dueAfter) {
    params.set('due_after', dueAfter)
  }
  if (includeDrafts !== undefined) {
    params.set('include_drafts', String(includeDrafts))
  }
  if (sortBy) {
    params.set('sort_by', sortBy)
  }
  return `/v1/tasks/?${params.toString()}`
}

/**
 * The caller's own activities across the organization. No assignee parameter —
 * the endpoint reads the caller from the token, and there is deliberately no
 * way to point it at somebody else's queue. Leaving `sortBy` unset keeps the
 * server's default (due-date ascending), which is the queue's natural order.
 */
export const listAssignedSubtasks = ({
  organizationId,
  page = 1,
  pageSize = 20,
  search,
  status,
  projectId,
  priority,
  risk,
  isBlocked,
  dueBefore,
  dueAfter,
  sortBy,
}: {
  organizationId: string
  page?: number
  pageSize?: number
  search?: string
  status?: string
  projectId?: string
  priority?: TaskPriority | 'all'
  risk?: TaskRiskFilter
  isBlocked?: boolean
  dueBefore?: string
  dueAfter?: string
  sortBy?: TaskSortBy
}) => {
  const params = new URLSearchParams({
    organization_id: organizationId,
    page: String(page),
    page_size: String(pageSize),
  })
  // The "all" sentinels and an empty box are not filters — see
  // `listOrganizationTasks`, which omits them for the same reason.
  if (search?.trim()) {
    params.set('search', search.trim())
  }
  if (status && status !== 'all') {
    params.set('status', status)
  }
  if (projectId && projectId !== 'all') {
    params.set('project_id', projectId)
  }
  if (priority && priority !== 'all') {
    params.set('priority', priority)
  }
  if (risk) {
    params.set('risk', risk)
  }
  if (isBlocked !== undefined) {
    params.set('is_blocked', String(isBlocked))
  }
  if (dueBefore) {
    params.set('due_before', dueBefore)
  }
  if (dueAfter) {
    params.set('due_after', dueAfter)
  }
  if (sortBy) {
    params.set('sort_by', sortBy)
  }
  return `/v1/tasks/assigned?${params.toString()}`
}

export const getTask = (id: string) => `/v1/tasks/${id}`

export const createTask = ({
  projectId,
  body,
}: {
  projectId: string
  body: TaskCreateRequestDTO
}) => ({
  url: `/v1/tasks/projects/${projectId}/tasks`,
  method: 'POST',
  body,
})

export const updateTask = ({
  id,
  body,
}: {
  id: string
  body: TaskUpdateRequestDTO
}) => ({
  url: `/v1/tasks/${id}`,
  method: 'PUT',
  body,
})

export const deleteTask = (id: string) => ({
  url: `/v1/tasks/${id}`,
  method: 'DELETE',
})

export const updateTaskStatus = ({
  id,
  body,
}: {
  id: string
  body: TaskStatusUpdateRequestDTO
}) => ({
  url: `/v1/tasks/${id}/status`,
  method: 'PATCH',
  body,
})

export const updateTaskBudget = ({
  id,
  body,
}: {
  id: string
  body: TaskBudgetUpdateRequestDTO
}) => ({
  url: `/v1/tasks/${id}/budget`,
  method: 'PATCH',
  body,
})

/**
 * The direct door of force-start, for whoever holds `forceStart.direct`
 * (owner/admin/manager). A `user` has no key here and files a request instead
 * (`@/services/force-start`) — nobody holds both, so self-approval cannot
 * arise. Empty body: the call *is* the action.
 */
export const forceStartTask = (id: string) => ({
  url: `/v1/tasks/${id}/force-start`,
  method: 'POST',
  body: {},
})
