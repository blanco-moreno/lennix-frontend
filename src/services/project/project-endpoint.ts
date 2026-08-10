import type { ProjectPriority, ProjectSortBy, ProjectStatus } from '@/types'
import type {
  ProjectUpdateRequestDTO,
  ProjectPriorityUpdateRequestDTO,
  ProjectBudgetUpdateRequestDTO,
  ProjectTeamMemberAddRequestDTO,
} from '@/types/dto/project-dto'

/**
 * One page of the searchable project picker.
 *
 * A first screenful rather than a ceiling: the box sends what was typed as
 * `search`, so the project that is not on this page is found by typing its
 * name, not by raising the number. Sized to the policy maximum of 20, which is
 * also the most the server will accept.
 */
export const PROJECT_SEARCH_PAGE_SIZE = 20

/**
 * The paginated project list.
 *
 * Every filter is sent to the server so the list and its paginator answer the
 * same question. Filtering the fetched page in the browser instead is what made
 * the empty state lie: searching "Bodega" from page 1 of 5 answered "no active
 * projects" while Bodega sat on page 3.
 *
 * Built with `URLSearchParams` rather than string concatenation: with a dozen
 * optional parameters, hand-rolled `&` glue and per-value `encodeURIComponent`
 * is one forgotten call away from a malformed query. `task-endpoint.ts` builds
 * its listings the same way — one grammar for the same job.
 */
export const listProjectsPaginated = ({
  organizationId,
  page = 1,
  pageSize = 20,
  isDraft,
  search,
  status,
  priority,
  managerId,
  isOverBudget,
  isDelayed,
  dueBefore,
  dueAfter,
  sortBy,
}: {
  organizationId: string
  page?: number
  pageSize?: number
  isDraft?: boolean
  search?: string
  status?: ProjectStatus | 'all'
  priority?: ProjectPriority | 'all'
  managerId?: string
  isOverBudget?: boolean
  isDelayed?: boolean
  /** `YYYY-MM-DD`. An obra with no due date matches neither bound. */
  dueBefore?: string
  dueAfter?: string
  sortBy?: ProjectSortBy
}) => {
  const params = new URLSearchParams({
    organization_id: organizationId,
    page: String(page),
    page_size: String(pageSize),
  })
  // A boolean filter is tri-state on the wire: `true` and `false` each narrow,
  // and leaving the parameter out is what asks for both.
  if (isDraft !== undefined) {
    params.set('is_draft', String(isDraft))
  }
  // An empty box and a cleared select are not filters — omit them rather than
  // sending `search=` / `status=all`, which the backend would refuse or
  // misread.
  if (search?.trim()) {
    params.set('search', search.trim())
  }
  if (status && status !== 'all') {
    params.set('status', status)
  }
  if (priority && priority !== 'all') {
    params.set('priority', priority)
  }
  if (managerId && managerId !== 'all') {
    params.set('manager_id', managerId)
  }
  if (isOverBudget !== undefined) {
    params.set('is_over_budget', String(isOverBudget))
  }
  if (isDelayed !== undefined) {
    params.set('is_delayed', String(isDelayed))
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
  return `/v1/projects?${params.toString()}`
}

export const getProject = (id: string) => `/v1/projects/${id}`

export const updateProject = ({
  id,
  body,
}: {
  id: string
  body: ProjectUpdateRequestDTO
}) => ({
  url: `/v1/projects/${id}`,
  method: 'PUT',
  body,
})

export const deleteProject = (id: string) => ({
  url: `/v1/projects/${id}`,
  method: 'DELETE',
})

export const updateProjectPriority = ({
  id,
  body,
}: {
  id: string
  body: ProjectPriorityUpdateRequestDTO
}) => ({
  url: `/v1/projects/${id}/priority`,
  method: 'PATCH',
  body,
})

export const updateProjectBudget = ({
  id,
  body,
}: {
  id: string
  body: ProjectBudgetUpdateRequestDTO
}) => ({
  url: `/v1/projects/${id}/budget`,
  method: 'PATCH',
  body,
})

export const getProjectBudget = (id: string) => `/v1/projects/${id}/budget`

export const archiveProject = (id: string) => ({
  url: `/v1/projects/${id}/archive`,
  method: 'POST',
})

export const unarchiveProject = (id: string) => ({
  url: `/v1/projects/${id}/unarchive`,
  method: 'POST',
})

export const getProjectTeam = (id: string) => `/v1/projects/${id}/team`

/**
 * The server's hard ceiling on a page (`MAX_PAGE_SIZE` in ms-bk). The
 * assignable-members list has no search parameter, so the picker reads every
 * page rather than showing the first twenty and hiding the rest.
 */
export const ASSIGNABLE_MEMBERS_PAGE_SIZE = 20

/** One page of who the obra would accept as an assignee or as jefe de obra. */
export const getAssignableMembers = (projectId: string, page: number) =>
  `/v1/projects/${projectId}/assignable-members?page=${page}&page_size=${ASSIGNABLE_MEMBERS_PAGE_SIZE}`

/**
 * One page of the project Historial.
 *
 * The tab shows a growing list behind a "load more" button. The server caps
 * `page_size` at 20, so the button pages forward and accumulates in the cache
 * — it means "one more page", never "one bigger page".
 */
export const PROJECT_ACTIVITY_PAGE_SIZE = 20

/**
 * The project Historial — newest first, `Page` envelope,
 * gated by the same membership rule as the rest of the project surface.
 */
export const getProjectActivity = ({
  projectId,
  page = 1,
  pageSize = PROJECT_ACTIVITY_PAGE_SIZE,
}: {
  projectId: string
  page?: number
  pageSize?: number
}) => `/v1/projects/${projectId}/activity?page=${page}&page_size=${pageSize}`

export const addTeamMember = ({
  projectId,
  body,
}: {
  projectId: string
  body: ProjectTeamMemberAddRequestDTO
}) => ({
  url: `/v1/projects/${projectId}/team`,
  method: 'POST',
  body,
})

export const removeTeamMember = ({
  projectId,
  userId,
}: {
  projectId: string
  userId: string
}) => ({
  url: `/v1/projects/${projectId}/team/${userId}`,
  method: 'DELETE',
})
