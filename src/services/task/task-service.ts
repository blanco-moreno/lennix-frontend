import type {
  Page,
  AssignedSubtask,
  Task,
  TaskPriority,
  TaskRiskFilter,
  TaskSortBy,
} from '@/types'
import type {
  TaskCreateRequestDTO,
  TaskUpdateRequestDTO,
  TaskStatusUpdateRequestDTO,
  TaskBudgetUpdateRequestDTO,
} from '@/types/dto/task-dto'

import { api } from '../api-injector'
import {
  SCHEDULE_INVALIDATION_TAGS,
  providesPageTags,
  providesScopedListTags,
  scopeTagTypes,
} from '../cache-tags'

import {
  listProjectTasks,
  listOrganizationTasks,
  listAssignedSubtasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskBudget,
  forceStartTask,
} from './task-endpoint'
import {
  mapTaskDTOToTask,
  mapTaskDTOArrayToTasks,
  mapPageOfAssignedSubtasks,
  mapPageOfTasks,
} from './task-mappers'

/** Deleting a task needs its project for scoped cache invalidation. */
interface DeleteTaskArg {
  id: string
  projectId: string
}

export const taskApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listProjectTasks: builder.query<Task[], string>({
      query: listProjectTasks,
      transformResponse: mapTaskDTOArrayToTasks,
      providesTags: providesScopedListTags<Task>('Task', 'project'),
    }),

    /**
     * The whole argument object is the cache key — RTK Query's default
     * serializer stringifies it — so each filter combination gets its own
     * entry. No custom `serializeQueryArgs` here on purpose: one that dropped a
     * filter would answer a new question with the old question's rows.
     */
    listOrganizationTasks: builder.query<
      Page<Task>,
      {
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
        dueBefore?: string
        dueAfter?: string
        includeDrafts?: boolean
        sortBy?: TaskSortBy
      }
    >({
      query: listOrganizationTasks,
      transformResponse: mapPageOfTasks,
      providesTags: providesPageTags<Task>('Task'),
    }),

    /**
     * The "assigned to me" queue. Its rows are **subactivities**, so it is
     * tagged `Subtask` — reporting progress on one has to refresh the queue it
     * came from, and the `Task` tag would not do that.
     */
    listAssignedSubtasks: builder.query<
      Page<AssignedSubtask>,
      {
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
      }
    >({
      query: listAssignedSubtasks,
      transformResponse: mapPageOfAssignedSubtasks,
      providesTags: providesPageTags<AssignedSubtask>('Subtask'),
    }),

    getTask: builder.query<Task, string>({
      query: getTask,
      transformResponse: mapTaskDTOToTask,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),

    createTask: builder.mutation<
      Task,
      { projectId: string; body: TaskCreateRequestDTO }
    >({
      query: createTask,
      transformResponse: mapTaskDTOToTask,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Task', id: `project-${projectId}` },
        { type: 'Project', id: projectId },
        ...scopeTagTypes(
          [
            'ProjectBudget',
            'CostReport',
            'CriticalPath',
            'Dashboard',
            'CompletionStats',
            'ProjectActivity',
          ],
          projectId,
        ),
      ],
    }),

    updateTask: builder.mutation<
      Task,
      { id: string; body: TaskUpdateRequestDTO }
    >({
      query: updateTask,
      transformResponse: mapTaskDTOToTask,
      invalidatesTags: (result, _error, { id }) => [
        { type: 'Task', id },
        ...(result
          ? [
              { type: 'Project' as const, id: result.projectId },
              { type: 'Task' as const, id: `project-${result.projectId}` },
              { type: 'Dependency' as const, id: result.projectId },
            ]
          : []),
        ...scopeTagTypes(
          [
            'ProjectBudget',
            'CostReport',
            'CriticalPath',
            'Dashboard',
            'CompletionStats',
            'ProjectActivity',
          ],
          result?.projectId,
        ),
      ],
    }),

    // The caller passes `projectId` alongside the id so the invalidation is
    // scoped: the same twelve caches are busted, but only for this project —
    // never other cached projects' budget, cost report or analytics.
    deleteTask: builder.mutation<void, DeleteTaskArg>({
      query: ({ id }) => deleteTask(id),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        { type: 'Task', id },
        { type: 'Task', id: `project-${projectId}` },
        { type: 'Subtask', id: `task-${id}` },
        { type: 'Expense', id: `project-${projectId}` },
        { type: 'BudgetVariance', id },
        { type: 'Project', id: projectId },
        ...scopeTagTypes(
          [
            'ProjectBudget',
            'CostReport',
            'ProjectActivity',
            ...SCHEDULE_INVALIDATION_TAGS,
          ],
          projectId,
        ),
        // Soft-delete: the task lands in the papelera list.
        { type: 'Trash', id: 'tasks' },
      ],
    }),

    updateTaskStatus: builder.mutation<
      Task,
      { id: string; body: TaskStatusUpdateRequestDTO }
    >({
      query: updateTaskStatus,
      transformResponse: mapTaskDTOToTask,
      invalidatesTags: (result, _error, { id }) => [
        { type: 'Task', id },
        ...(result
          ? [
              { type: 'Project' as const, id: result.projectId },
              { type: 'Task' as const, id: `project-${result.projectId}` },
            ]
          : []),
        ...scopeTagTypes(
          [...SCHEDULE_INVALIDATION_TAGS, 'ProjectActivity'],
          result?.projectId,
        ),
      ],
    }),

    /**
     * Overriding the block outright. It unblocks the activity and stamps the
     * permanent at-risk mark server-side, so it busts exactly what an approved
     * request busts — the task's row, its project and the whole schedule.
     */
    forceStartTask: builder.mutation<Task, string>({
      query: forceStartTask,
      transformResponse: mapTaskDTOToTask,
      invalidatesTags: (result, _error, id) => [
        { type: 'Task', id },
        ...(result
          ? [
              { type: 'Project' as const, id: result.projectId },
              { type: 'Task' as const, id: `project-${result.projectId}` },
            ]
          : []),
        ...scopeTagTypes(
          [...SCHEDULE_INVALIDATION_TAGS, 'ProjectActivity'],
          result?.projectId,
        ),
      ],
    }),

    updateTaskBudget: builder.mutation<
      Task,
      { id: string; body: TaskBudgetUpdateRequestDTO }
    >({
      query: updateTaskBudget,
      transformResponse: mapTaskDTOToTask,
      invalidatesTags: (result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'BudgetVariance', id },
        ...(result ? [{ type: 'Project' as const, id: result.projectId }] : []),
        ...scopeTagTypes(
          ['ProjectBudget', 'CostReport', 'Dashboard', 'ProjectActivity'],
          result?.projectId,
        ),
      ],
    }),
  }),
})

export const {
  useListProjectTasksQuery,
  useListOrganizationTasksQuery,
  useListAssignedSubtasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskBudgetMutation,
  useForceStartTaskMutation,
} = taskApi
