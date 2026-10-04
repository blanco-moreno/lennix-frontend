import type {
  ActivateScheduleResult,
  ImportJob,
  ImportUploadResult,
  ProjectActivationDetails,
  ReviewStep,
  ReviewTaskBudgetsResult,
  ScheduleReviewState,
  TaskBudgetAllocation,
} from '@/types'
import type {
  ImportExecuteResponseDTO,
  ReviewTaskBudgetsResponseDTO,
} from '@/types/dto/project-import-dto'
import type {
  SubtaskCreateRequestDTO,
  SubtaskProgressUpdateRequestDTO,
} from '@/types/dto/subtask-dto'
import type { TaskCreateRequestDTO } from '@/types/dto/task-dto'

import { api } from '../api-injector'

import type { UpdateReviewRowArg } from './schedule-import-endpoint'
import {
  activateSchedule,
  createReviewPhase,
  deleteReviewRow,
  getImportJob,
  getScheduleReviewState,
  placeReviewRow,
  updateReviewProgress,
  updateReviewRow,
  updateReviewStep,
  updateReviewTaskBudgets,
  uploadScheduleFile,
} from './schedule-import-endpoint'
import {
  mapImportJobStatusDTO,
  mapImportUploadResponseDTO,
  mapReviewTaskBudgetsDTO,
  mapScheduleReviewStateDTO,
} from './schedule-import-mappers'

/**
 * What a review write busts: this draft's review state, the task lists that
 * render it, and the drafts listing — whose card reads the draft's own row.
 * Nothing wider — a correction to one draft must not refetch every cached
 * project's analytics.
 */
const reviewInvalidation = (
  _result: unknown,
  _error: unknown,
  { projectId }: { projectId: string },
) =>
  [
    { type: 'ScheduleReviewState', id: projectId },
    { type: 'Task', id: `project-${projectId}` },
    { type: 'Project', id: projectId },
    { type: 'Project', id: 'LIST' },
  ] as const

export const scheduleImportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadScheduleFile: builder.mutation<ImportUploadResult, FormData>({
      query: uploadScheduleFile,
      transformResponse: mapImportUploadResponseDTO,
      // A landed draft is a project: the drafts home has to show it on return,
      // and it consumes a draft slot the quota meter renders.
      // OrgUsage stays type-wide: the arg is raw FormData, no org id to scope by.
      invalidatesTags: [{ type: 'Project', id: 'LIST' }, { type: 'OrgUsage' }],
    }),

    getImportJob: builder.query<ImportJob, string>({
      query: getImportJob,
      transformResponse: mapImportJobStatusDTO,
      providesTags: (_result, _error, jobId) => [
        { type: 'ImportJob', id: jobId },
      ],
    }),

    getScheduleReviewState: builder.query<ScheduleReviewState, string>({
      query: getScheduleReviewState,
      transformResponse: mapScheduleReviewStateDTO,
      providesTags: (_result, _error, projectId) => [
        { type: 'ScheduleReviewState', id: projectId },
      ],
    }),

    activateSchedule: builder.mutation<
      ActivateScheduleResult,
      {
        projectId: string
        taskIds: string[]
        details?: ProjectActivationDetails
      }
    >({
      query: activateSchedule,
      transformResponse: (dto: ImportExecuteResponseDTO) => ({
        projectId: dto.project_id,
        projectName: dto.project_name,
        totalTasks: dto.total_tasks,
        startDate: dto.start_date,
        dueDate: dto.due_date,
      }),
      // Go-live changes what every project surface shows: the draft leaves the
      // drafts home, its tasks become live, and the engine starts computing.
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: 'LIST' },
        { type: 'Project', id: projectId },
        { type: 'Task', id: `project-${projectId}` },
        { type: 'ScheduleReviewState', id: projectId },
        { type: 'Dashboard', id: projectId },
        // Going live frees the draft slot and charges the live project quota.
        // Type-wide: the org id is not reachable from this arg (project id only).
        { type: 'OrgUsage' },
        { type: 'OrgDashboard' },
      ],
    }),

    // --- The correction surface ---
    //
    // One invalidation rule: whatever the review changes, the review state is
    // what the canvas re-reads. Each write carries `projectId` so the refetch
    // is scoped to this draft instead of every cached project. Edges are
    // written through the dependency endpoints, whose tags carry it too.

    updateReviewRow: builder.mutation<void, UpdateReviewRowArg>({
      query: updateReviewRow,
      invalidatesTags: reviewInvalidation,
    }),

    placeReviewRow: builder.mutation<
      void,
      { projectId: string; taskId: string; body: SubtaskCreateRequestDTO }
    >({
      query: placeReviewRow,
      invalidatesTags: reviewInvalidation,
    }),

    createReviewPhase: builder.mutation<
      void,
      { projectId: string; body: TaskCreateRequestDTO }
    >({
      query: createReviewPhase,
      invalidatesTags: reviewInvalidation,
    }),

    updateReviewProgress: builder.mutation<
      void,
      { projectId: string; id: string; body: SubtaskProgressUpdateRequestDTO }
    >({
      query: updateReviewProgress,
      invalidatesTags: reviewInvalidation,
    }),

    deleteReviewRow: builder.mutation<
      void,
      { projectId: string; level: 'task' | 'subtask'; id: string }
    >({
      query: deleteReviewRow,
      invalidatesTags: reviewInvalidation,
    }),

    /**
     * Both readers of the step go stale on this write: the drafts listing
     * prints the station a draft was left at, and the review state carries the
     * saved step the canvas resumes from when it is entered with no `?step`.
     * Leaving the latter cached is how a review re-entered from the listing in
     * the same session came back at the first station.
     */
    updateReviewStep: builder.mutation<
      void,
      { projectId: string; step: ReviewStep }
    >({
      query: updateReviewStep,
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: 'LIST' },
        { type: 'ScheduleReviewState', id: projectId },
      ],
    }),

    updateReviewTaskBudgets: builder.mutation<
      ReviewTaskBudgetsResult,
      { projectId: string; taskBudgets: TaskBudgetAllocation[] }
    >({
      query: updateReviewTaskBudgets,
      transformResponse: (dto: ReviewTaskBudgetsResponseDTO) =>
        mapReviewTaskBudgetsDTO(dto),
      invalidatesTags: reviewInvalidation,
    }),
  }),
})

export const {
  useUploadScheduleFileMutation,
  useGetImportJobQuery,
  useGetScheduleReviewStateQuery,
  useActivateScheduleMutation,
  useUpdateReviewRowMutation,
  useUpdateReviewStepMutation,
  useUpdateReviewTaskBudgetsMutation,
  usePlaceReviewRowMutation,
  useCreateReviewPhaseMutation,
  useDeleteReviewRowMutation,
  useUpdateReviewProgressMutation,
} = scheduleImportApi
