import { http, HttpResponse } from 'msw'

import {
  pageOf,
  resolveSeedProjectId,
  seedAssignableMembersDTO,
  seedDraftProjectListDTO,
  seedProjectBudgetDTO,
  seedProjectDTO,
  seedProjectDetailDTO,
  seedProjectListDTO,
  seedProjectActivityPageDTO,
  seedProjectTeamDTO,
} from '@/tests/fixtures'
import type { ProjectResponseDTO } from '@/types/dto/project-dto'

import { scopeProjectsToActor } from '../actor'

/** Domain severity, not alphabetical — `low < medium < high`, as the server ranks it. */
const PRIORITY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2 }

function sortProjects(
  items: ProjectResponseDTO[],
  sortBy: string,
): ProjectResponseDTO[] {
  const direction = sortBy.startsWith('-') ? -1 : 1
  const key = sortBy.replace(/^-/, '')
  const compare = (a: ProjectResponseDTO, b: ProjectResponseDTO): number => {
    switch (key) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'priority':
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      case 'progress':
        return a.progress - b.progress
      case 'due_date':
        return (a.due_date ?? '').localeCompare(b.due_date ?? '')
      default:
        return a.created_at.localeCompare(b.created_at)
    }
  }
  return [...items].sort((a, b) => direction * compare(a, b))
}

export const listProjectsHandler = http.get('*/v1/projects', ({ request }) => {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('page_size') ?? '20')
  // The pending import draft lives in its own home, never the main list.
  // Scoped by the acting role first, the way the backend does it: a `manager`
  // or `user` is served their obras, never the organization's.
  const all = scopeProjectsToActor(
    url.searchParams.get('is_draft') === 'true'
      ? seedDraftProjectListDTO()
      : seedProjectListDTO(),
  )

  // The query is the server's job, so the mock has to do it too — a handler
  // that ignored the filters would let a surface stop sending them and still look right.
  const search = url.searchParams.get('search')?.trim().toLowerCase()
  const status = url.searchParams.get('status')
  const priority = url.searchParams.get('priority')
  const managerId = url.searchParams.get('manager_id')
  const overBudget = url.searchParams.get('is_over_budget')
  const dueBefore = url.searchParams.get('due_before')
  const dueAfter = url.searchParams.get('due_after')
  const sortBy = url.searchParams.get('sort_by')

  let items = all
  if (search) {
    items = items.filter((p) =>
      [p.name, p.description, p.location].some((field) =>
        field?.toLowerCase().includes(search),
      ),
    )
  }
  if (status) {
    items = items.filter((p) => p.status === status)
  }
  if (priority) {
    items = items.filter((p) => p.priority === priority)
  }
  if (managerId) {
    items = items.filter((p) => p.manager_id === managerId)
  }
  if (overBudget) {
    items = items.filter((p) => p.is_over_budget === (overBudget === 'true'))
  }
  // An obra with no due date matches neither bound — the backend's rule, and
  // the reason the range is not a pair of `<=` over a nullable column here either.
  if (dueBefore) {
    items = items.filter((p) => p.due_date !== null && p.due_date <= dueBefore)
  }
  if (dueAfter) {
    items = items.filter((p) => p.due_date !== null && p.due_date >= dueAfter)
  }
  if (sortBy) {
    items = sortProjects(items, sortBy)
  }

  return HttpResponse.json({
    items,
    total: items.length,
    page,
    page_size: pageSize,
    total_pages: 1,
  })
})

export const getProjectHandler = http.get(
  '*/v1/projects/:projectId',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectDetailDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const updateProjectHandler = http.put(
  '*/v1/projects/:projectId',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const deleteProjectHandler = http.delete(
  '*/v1/projects/:projectId',
  () => {
    return new HttpResponse(null, { status: 204 })
  },
)

/** Discarding drafts from the Borradores home. */
export const bulkDeleteProjectsHandler = http.post(
  '*/v1/projects/bulk-delete',
  () => {
    return new HttpResponse(null, { status: 204 })
  },
)

export const updateProjectStatusHandler = http.patch(
  '*/v1/projects/:projectId/status',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const updateProjectPriorityHandler = http.patch(
  '*/v1/projects/:projectId/priority',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const updateProjectBudgetHandler = http.patch(
  '*/v1/projects/:projectId/budget',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const getProjectBudgetHandler = http.get(
  '*/v1/projects/:projectId/budget',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectBudgetDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const archiveProjectHandler = http.post(
  '*/v1/projects/:projectId/archive',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectDTO(resolveSeedProjectId(params.projectId), {
        status: 'archived',
      }),
    )
  },
)

export const unarchiveProjectHandler = http.post(
  '*/v1/projects/:projectId/unarchive',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectDTO(resolveSeedProjectId(params.projectId), {
        status: 'on_track',
      }),
    )
  },
)

export const getProjectTeamHandler = http.get(
  '*/v1/projects/:projectId/team',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectTeamDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

/** Who the obra accepts as an assignee — one full `Page`, no paging needed. */
export const getAssignableMembersHandler = http.get(
  '*/v1/projects/:projectId/assignable-members',
  ({ params }) => {
    return HttpResponse.json(
      pageOf(seedAssignableMembersDTO(resolveSeedProjectId(params.projectId))),
    )
  },
)

/** The project Historial — a `Page`, newest first. */
export const getProjectActivityHandler = http.get(
  '*/v1/projects/:projectId/activity',
  ({ request }) => {
    const url = new URL(request.url)
    return HttpResponse.json(
      seedProjectActivityPageDTO(undefined, {
        page: Number(url.searchParams.get('page') ?? '1'),
        pageSize: Number(url.searchParams.get('page_size') ?? '25'),
      }),
    )
  },
)

/** Echoes back a new membership row modelled on the project's existing team. */
export const addTeamMemberHandler = http.post(
  '*/v1/projects/:projectId/team',
  ({ params }) => {
    const team = seedProjectTeamDTO(resolveSeedProjectId(params.projectId))
    return HttpResponse.json(
      { ...team[team.length - 1], id: team.length + 1, role: 'member' },
      { status: 201 },
    )
  },
)

export const removeTeamMemberHandler = http.delete(
  '*/v1/projects/:projectId/team/:userId',
  () => {
    return new HttpResponse(null, { status: 204 })
  },
)

export const projectHandlers = [
  listProjectsHandler,
  getProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  bulkDeleteProjectsHandler,
  updateProjectStatusHandler,
  updateProjectPriorityHandler,
  updateProjectBudgetHandler,
  getProjectBudgetHandler,
  archiveProjectHandler,
  unarchiveProjectHandler,
  getProjectTeamHandler,
  getAssignableMembersHandler,
  getProjectActivityHandler,
  addTeamMemberHandler,
  removeTeamMemberHandler,
]
