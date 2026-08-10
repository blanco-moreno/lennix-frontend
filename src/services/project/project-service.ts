import type {
  AssignableMember,
  Page,
  Project,
  ProjectActivity,
  ProjectDetail,
  ProjectBudget,
  ProjectMember,
  ProjectPriority,
  ProjectSortBy,
  ProjectStatus,
} from '@/types'
import type { PageDTO } from '@/types/dto/pagination-dto'
import type {
  AssignableMemberResponseDTO,
  ProjectUpdateRequestDTO,
  ProjectPriorityUpdateRequestDTO,
  ProjectBudgetUpdateRequestDTO,
  ProjectTeamMemberAddRequestDTO,
} from '@/types/dto/project-dto'

import { api } from '../api-injector'
import { providesPageTags } from '../cache-tags'

import {
  listProjectsPaginated,
  getProject,
  updateProject,
  deleteProject,
  updateProjectPriority,
  updateProjectBudget,
  getProjectBudget,
  archiveProject,
  unarchiveProject,
  getProjectTeam,
  getAssignableMembers,
  getProjectActivity,
  addTeamMember,
  removeTeamMember,
} from './project-endpoint'
import {
  mapAssignableMemberResponseDTOToAssignableMember,
  mapProjectDTOToProject,
  mapPageOfProjects,
  mapProjectDetailDTOToProjectDetail,
  mapProjectBudgetResponseDTOToProjectBudget,
  mapProjectMemberResponseDTOToProjectMember,
  mapProjectMemberArrayToProjectMembers,
  mapPageOfProjectActivity,
} from './project-mappers'

export const projectApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Every filter is part of the argument object, and the argument object is
     * the cache key: RTK Query's default `serializeQueryArgs` stringifies it
     * whole, so two different filter combinations are two entries. Do not add a
     * custom serializer here — dropping a filter from the key would serve the
     * previous filter's rows under the new filter's question.
     */
    listProjectsPaginated: builder.query<
      Page<Project>,
      {
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
        dueBefore?: string
        dueAfter?: string
        sortBy?: ProjectSortBy
      }
    >({
      query: listProjectsPaginated,
      transformResponse: mapPageOfProjects,
      providesTags: providesPageTags<Project>('Project'),
    }),

    getProject: builder.query<ProjectDetail, string>({
      query: getProject,
      transformResponse: mapProjectDetailDTOToProjectDetail,
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),

    updateProject: builder.mutation<
      Project,
      { id: string; body: ProjectUpdateRequestDTO }
    >({
      query: updateProject,
      transformResponse: mapProjectDTOToProject,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
        { type: 'Dashboard', id },
        { type: 'ProjectActivity', id },
        // A draft's review state embeds the project's own fields, so renaming
        // or re-budgeting one makes that cached read stale — the import wizard
        // would show the old name to anyone who came back to the draft.
        { type: 'ScheduleReviewState', id },
      ],
    }),

    deleteProject: builder.mutation<void, string>({
      query: deleteProject,
      invalidatesTags: (_result, _error, id) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
        { type: 'Task', id: `project-${id}` },
        { type: 'Subtask' },
        { type: 'ProjectBudget', id },
        { type: 'ProjectTeam', id },
        { type: 'CriticalPath', id },
        { type: 'Dependency', id },
        { type: 'Expense', id: `project-${id}` },
        { type: 'CostReport', id },
        { type: 'BudgetVariance' },
        { type: 'Dashboard', id },
        { type: 'CompletionStats', id },
        { type: 'DelayAnalysis', id },
        { type: 'OrgDashboard' },
        // Deleting a draft frees a plan slot, so the Borradores quota meter
        // must not keep showing a stale count.
        // Type-wide: the org id is not reachable from this arg (project id only).
        { type: 'OrgUsage' },
        // Soft-delete: the project lands in the papelera list.
        { type: 'Trash', id: 'projects' },
      ],
    }),

    bulkDeleteProjects: builder.mutation<void, string[]>({
      query: (projectIds) => ({
        url: '/v1/projects/bulk-delete',
        method: 'POST',
        body: { project_ids: projectIds },
      }),
      invalidatesTags: (_result, _error, ids) => [
        { type: 'Project', id: 'LIST' },
        { type: 'OrgDashboard' },
        // Type-wide: the org id is not reachable from this arg (project ids only).
        { type: 'OrgUsage' },
        // Soft-delete: the projects land in the papelera list.
        { type: 'Trash', id: 'projects' },
        ...(ids || []).map((id) => ({ type: 'Project' as const, id })),
        ...(ids || []).map((id) => ({
          type: 'Task' as const,
          id: `project-${id}`,
        })),
      ],
    }),

    updateProjectPriority: builder.mutation<
      Project,
      { id: string; body: ProjectPriorityUpdateRequestDTO }
    >({
      query: updateProjectPriority,
      transformResponse: mapProjectDTOToProject,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
        { type: 'ProjectActivity', id },
      ],
    }),

    updateProjectBudget: builder.mutation<
      Project,
      { id: string; body: ProjectBudgetUpdateRequestDTO }
    >({
      query: updateProjectBudget,
      transformResponse: mapProjectDTOToProject,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
        { type: 'ProjectBudget', id },
        { type: 'CostReport', id },
        { type: 'BudgetVariance' },
        { type: 'Task', id: `project-${id}` },
        { type: 'ProjectActivity', id },
      ],
    }),

    getProjectBudget: builder.query<ProjectBudget, string>({
      query: getProjectBudget,
      transformResponse: mapProjectBudgetResponseDTOToProjectBudget,
      providesTags: (_result, _error, id) => [{ type: 'ProjectBudget', id }],
    }),

    archiveProject: builder.mutation<Project, string>({
      query: archiveProject,
      transformResponse: mapProjectDTOToProject,
      invalidatesTags: (_result, _error, id) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
        { type: 'Dashboard', id },
        { type: 'OrgDashboard' },
        { type: 'ProjectActivity', id },
      ],
    }),

    unarchiveProject: builder.mutation<Project, string>({
      query: unarchiveProject,
      transformResponse: mapProjectDTOToProject,
      invalidatesTags: (_result, _error, id) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
        { type: 'Dashboard', id },
        { type: 'OrgDashboard' },
        { type: 'ProjectActivity', id },
      ],
    }),

    getProjectTeam: builder.query<ProjectMember[], string>({
      query: getProjectTeam,
      transformResponse: mapProjectMemberArrayToProjectMembers,
      providesTags: (_result, _error, id) => [
        { type: 'ProjectTeam' as const, id },
      ],
    }),

    /**
     * Who the obra accepts as an assignee or as jefe de obra — the team plus
     * whoever reaches it through the organization gate (`owner`/`admin`).
     *
     * Read whole, not page by page: the endpoint has no `search`, and the
     * server caps a page at 20, so a picker fed one page would hide exactly the
     * people this list exists to surface. Tagged `ProjectTeam` — adding or
     * removing a member is what changes `isProjectMember`.
     */
    getAssignableMembers: builder.query<AssignableMember[], string>({
      async queryFn(projectId, _api, _extra, baseQuery) {
        const members: AssignableMember[] = []
        for (let page = 1; ; page++) {
          const result = await baseQuery(getAssignableMembers(projectId, page))
          if (result.error) return { error: result.error }
          const dto = result.data as PageDTO<AssignableMemberResponseDTO>
          members.push(
            ...dto.items.map(mapAssignableMemberResponseDTOToAssignableMember),
          )
          if (page >= dto.total_pages || dto.items.length === 0) break
        }
        return { data: members }
      },
      providesTags: (_result, _error, id) => [
        { type: 'ProjectTeam' as const, id },
      ],
    }),

    /**
     * The project Historial — the project's own record,
     * identical for everyone who can open the obra.
     *
     * Tagged per project rather than per row: the feed is append-only and has
     * no mutation of its own, so there is nothing to invalidate row by row.
     * The caller asks for a fresh read on mount (`refetchOnMountOrArgChange`)
     * because the record is what *happened* — somebody who just completed an
     * activity and opens the tab has to see it.
     */
    getProjectActivity: builder.query<
      Page<ProjectActivity>,
      { projectId: string; page?: number; pageSize?: number }
    >({
      query: getProjectActivity,
      transformResponse: mapPageOfProjectActivity,
      providesTags: (_result, _error, { projectId }) => [
        { type: 'ProjectActivity' as const, id: projectId },
      ],
      // An accumulating list, keyed by project alone: "load more" asks for the
      // next *page*, and the pages pile up in one cache entry. The server caps
      // page size at 20, so growing the list must page forward, never request
      // a bigger page.
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}(${queryArgs.projectId})`,
      merge: (cache, incoming, { arg }) => {
        // Page 1 is the fresh read the tab does on mount, so it replaces rather
        // than appends — otherwise reopening the tab would double every row.
        if ((arg.page ?? 1) === 1) return incoming
        cache.items.push(...incoming.items)
        cache.page = incoming.page
        cache.total = incoming.total
        cache.totalPages = incoming.totalPages
        return cache
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
    }),

    addTeamMember: builder.mutation<
      ProjectMember,
      { projectId: string; body: ProjectTeamMemberAddRequestDTO }
    >({
      query: addTeamMember,
      transformResponse: mapProjectMemberResponseDTOToProjectMember,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'ProjectTeam' as const, id: projectId },
        { type: 'OrgMembers' },
      ],
    }),

    removeTeamMember: builder.mutation<
      void,
      { projectId: string; userId: string }
    >({
      query: removeTeamMember,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'ProjectTeam' as const, id: projectId },
        { type: 'Task', id: `project-${projectId}` },
        { type: 'OrgMembers' },
      ],
    }),
  }),
})

export const {
  useListProjectsPaginatedQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectPriorityMutation,
  useUpdateProjectBudgetMutation,
  useGetProjectBudgetQuery,
  useArchiveProjectMutation,
  useUnarchiveProjectMutation,
  useGetProjectTeamQuery,
  useGetAssignableMembersQuery,
  useGetProjectActivityQuery,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useBulkDeleteProjectsMutation,
} = projectApi
