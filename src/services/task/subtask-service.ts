import type { Subtask } from '@/types'
import type {
  SubtaskCreateRequestDTO,
  SubtaskUpdateRequestDTO,
  SubtaskProgressUpdateRequestDTO,
  SubtaskStatusUpdateRequestDTO,
} from '@/types/dto/subtask-dto'

import { api } from '../api-injector'
import {
  buildExpenseInvalidationTags,
  type AppTagType,
  type ExpenseScope,
} from '../cache-tags'
import { providesScopedListTags, scopeTagTypes } from '../cache-tags'

import {
  createSubtask,
  listSubtasks,
  getSubtask,
  updateSubtask,
  deleteSubtask,
  updateSubtaskProgress,
  updateSubtaskStatus,
  forceStartSubtask,
} from './subtask-endpoint'
import {
  mapSubtaskDTOToSubtask,
  mapSubtaskDTOArrayToSubtasks,
} from './task-mappers'

/** Deleting a subtask needs its task + project for scoped cache invalidation. */
interface DeleteSubtaskArg extends Omit<ExpenseScope, 'subtaskId'> {
  id: string
}

/**
 * Tags for a subtask write, following the deleteSubtask pattern: when the
 * caller passes `projectId` the schedule-shaped tags scope to that project;
 * without it the same tag types stay type-wide, so existing call sites keep
 * working unchanged.
 */
const subtaskWriteTags = (
  result: Subtask | undefined,
  projectId: string | undefined,
  types: readonly AppTagType[],
) => [
  // The parent phase's own row — progress/status/spend roll up into it.
  ...(result ? [{ type: 'Task' as const, id: result.parentId }] : []),
  projectId
    ? { type: 'Task' as const, id: `project-${projectId}` }
    : { type: 'Task' as const },
  // The cross-project "assigned to me" queue renders these rows.
  { type: 'Subtask' as const, id: 'LIST' },
  ...scopeTagTypes(['Project', ...types, 'ProjectActivity'], projectId),
]

export const subtaskApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSubtask: builder.mutation<
      Subtask,
      // `projectId` is optional: when passed the invalidation scopes to that
      // project; without it the tags stay type-wide.
      { taskId: string; projectId?: string; body: SubtaskCreateRequestDTO }
    >({
      query: createSubtask,
      transformResponse: mapSubtaskDTOToSubtask,
      invalidatesTags: (_result, _error, { taskId, projectId }) => [
        { type: 'Task', id: taskId },
        { type: 'Subtask', id: `task-${taskId}` },
        // The cross-project "assigned to me" queue picks up the new row.
        { type: 'Subtask', id: 'LIST' },
        ...scopeTagTypes(
          ['Project', 'Dashboard', 'CompletionStats', 'ProjectActivity'],
          projectId,
        ),
      ],
    }),

    listSubtasks: builder.query<Subtask[], string>({
      query: listSubtasks,
      transformResponse: mapSubtaskDTOArrayToSubtasks,
      providesTags: providesScopedListTags<Subtask>('Subtask', 'task'),
    }),

    getSubtask: builder.query<Subtask, string>({
      query: getSubtask,
      transformResponse: mapSubtaskDTOToSubtask,
      providesTags: (_result, _error, id) => [{ type: 'Subtask', id }],
    }),

    updateSubtask: builder.mutation<
      Subtask,
      { id: string; projectId?: string; body: SubtaskUpdateRequestDTO }
    >({
      query: updateSubtask,
      transformResponse: mapSubtaskDTOToSubtask,
      invalidatesTags: (result, _error, { id, projectId }) => [
        { type: 'Subtask', id },
        ...subtaskWriteTags(result, projectId, [
          'Dependency',
          'CriticalPath',
          'Dashboard',
          'CompletionStats',
        ]),
      ],
    }),

    // Scoped by the subtask's own task/project (passed in by the caller) so a
    // subtask delete never refetches other projects' budget and analytics
    // caches.
    deleteSubtask: builder.mutation<void, DeleteSubtaskArg>({
      query: ({ id }) => deleteSubtask(id),
      invalidatesTags: (_result, _error, { id, taskId, projectId }) => [
        { type: 'Subtask', id: `task-${taskId}` },
        ...buildExpenseInvalidationTags({ subtaskId: id, taskId, projectId }),
        ...scopeTagTypes(
          ['CriticalPath', 'Dependency', 'CompletionStats'],
          projectId,
        ),
        // Soft-delete: the subtask lands in the papelera's tasks list.
        { type: 'Trash', id: 'tasks' },
      ],
    }),

    updateSubtaskProgress: builder.mutation<
      Subtask,
      { id: string; projectId?: string; body: SubtaskProgressUpdateRequestDTO }
    >({
      query: updateSubtaskProgress,
      transformResponse: mapSubtaskDTOToSubtask,
      invalidatesTags: (result, _error, { id, projectId }) => [
        { type: 'Subtask', id },
        ...subtaskWriteTags(result, projectId, [
          'Dashboard',
          'CompletionStats',
        ]),
      ],
    }),

    updateSubtaskStatus: builder.mutation<
      Subtask,
      { id: string; projectId?: string; body: SubtaskStatusUpdateRequestDTO }
    >({
      query: updateSubtaskStatus,
      transformResponse: mapSubtaskDTOToSubtask,
      invalidatesTags: (result, _error, { id, projectId }) => [
        { type: 'Subtask', id },
        ...subtaskWriteTags(result, projectId, [
          'CriticalPath',
          'Dependency',
          'Dashboard',
          'CompletionStats',
          'DelayAnalysis',
        ]),
      ],
    }),

    /** The subactivity half of the direct override — see `forceStartTask`. */
    forceStartSubtask: builder.mutation<
      Subtask,
      { id: string; projectId?: string }
    >({
      query: forceStartSubtask,
      transformResponse: mapSubtaskDTOToSubtask,
      invalidatesTags: (result, _error, { id, projectId }) => [
        { type: 'Subtask', id },
        ...subtaskWriteTags(result, projectId, [
          'CriticalPath',
          'Dependency',
          'Dashboard',
          'CompletionStats',
          'DelayAnalysis',
        ]),
      ],
    }),
  }),
})

export const {
  useCreateSubtaskMutation,
  useListSubtasksQuery,
  useGetSubtaskQuery,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
  useUpdateSubtaskProgressMutation,
  useUpdateSubtaskStatusMutation,
  useForceStartSubtaskMutation,
} = subtaskApi
