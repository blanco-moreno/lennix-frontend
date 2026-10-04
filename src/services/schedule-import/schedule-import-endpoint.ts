/**
 * The schedule-import calls, in the order the hero flow makes them: upload,
 * follow the job, read the review state, correct it, activate. The correction
 * path writes through the ordinary task API — a draft's rows are ordinary rows.
 */

import type {
  ProjectActivationDetails,
  ReviewStep,
  ReviewSubtaskPatch,
  ReviewTaskPatch,
  TaskBudgetAllocation,
} from '@/types'
import type {
  SubtaskCreateRequestDTO,
  SubtaskProgressUpdateRequestDTO,
} from '@/types/dto/subtask-dto'
import type { TaskCreateRequestDTO } from '@/types/dto/task-dto'

/**
 * A review correction, addressed by level — the discrimination is what keeps a
 * phase edit from claiming the dates only a subactivity accepts.
 */
export type UpdateReviewRowArg =
  | { projectId: string; level: 'task'; id: string; body: ReviewTaskPatch }
  | {
      projectId: string
      level: 'subtask'
      id: string
      body: ReviewSubtaskPatch
    }

export const uploadScheduleFile = (body: FormData) => ({
  url: '/v1/schedule/import',
  method: 'POST',
  body,
})

export const getImportJob = (jobId: string) =>
  `/v1/schedule/import/jobs/${jobId}`

export const getScheduleReviewState = (projectId: string) =>
  `/v1/schedule/review/${projectId}`

/**
 * Remember where the review was left, so it resumes there on another device.
 * The URL is what the browser navigates by; this is the memory behind it.
 */
export const updateReviewStep = ({
  projectId,
  step,
}: {
  projectId: string
  step: ReviewStep
}) => ({
  url: `/v1/schedule/review/${projectId}/step`,
  method: 'PATCH',
  body: { step },
})

/**
 * The budget step's own write — main tasks only, and all-or-nothing: one id the
 * draft does not own rejects the whole batch (400 `unknown_review_tasks`).
 */
export const updateReviewTaskBudgets = ({
  projectId,
  taskBudgets,
}: {
  projectId: string
  taskBudgets: TaskBudgetAllocation[]
}) => ({
  url: `/v1/schedule/review/${projectId}/task-budgets`,
  method: 'PATCH',
  body: { task_budgets: taskBudgets },
})

/**
 * Go-live: from here the engine computes over the schedule's dependency
 * edges. Every imported main task ships — deselecting rows is a review action,
 * not a required decision on the activation path.
 *
 * `details` carries the optional project fields the review canvas let the user
 * edit. It only ever holds keys the user actually set: the backend reads absence
 * as "keep what the import produced", so spreading an over-eager object here
 * would rename or re-budget the project behind the user's back.
 */
export const activateSchedule = ({
  projectId,
  taskIds,
  details,
}: {
  projectId: string
  taskIds: string[]
  details?: ProjectActivationDetails
}) => ({
  url: `/v1/schedule/review/${projectId}/activate`,
  method: 'POST',
  body: { selected_task_ids: taskIds, ...details },
})

/** A review correction — the canvas floor and the date-order flip both land here. */
export const updateReviewRow = ({ level, id, body }: UpdateReviewRowArg) => ({
  url: level === 'task' ? `/v1/tasks/${id}` : `/v1/tasks/subtasks/${id}`,
  method: 'PUT',
  body,
})

/** Place a binned row under a phase — the row the parser could not classify. */
export const placeReviewRow = ({
  taskId,
  body,
}: {
  taskId: string
  body: SubtaskCreateRequestDTO
}) => ({
  url: `/v1/tasks/${taskId}/subtasks`,
  method: 'POST',
  body,
})

/** Add a main activity to the draft. `is_draft` keeps it out of the live lists. */
export const createReviewPhase = ({
  projectId,
  body,
}: {
  projectId: string
  body: TaskCreateRequestDTO
}) => ({
  url: `/v1/tasks/projects/${projectId}/tasks`,
  method: 'POST',
  body: { ...body, is_draft: true },
})

/**
 * Correct a draft subactivity's progress. Status follows it on the server
 * (`TSK-9`); a draft is never blocked, so the `DEP-7` refusal cannot apply.
 */
export const updateReviewProgress = ({
  id,
  body,
}: {
  id: string
  body: SubtaskProgressUpdateRequestDTO
}) => ({
  url: `/v1/tasks/subtasks/${id}/progress`,
  method: 'PATCH',
  body,
})

/** Remove a row from the draft — a soft delete, restorable from the trash. */
export const deleteReviewRow = ({
  level,
  id,
}: {
  level: 'task' | 'subtask'
  id: string
}) => ({
  url: level === 'task' ? `/v1/tasks/${id}` : `/v1/tasks/subtasks/${id}`,
  method: 'DELETE',
})
