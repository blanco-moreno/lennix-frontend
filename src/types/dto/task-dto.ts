/**
 * Task API DTOs — matches the backend contract for /v1/tasks endpoints.
 */

import type { SubtaskInputDTO, SubtaskResponseDTO } from './subtask-dto'

/**
 * The wire spells these as strings, but the vocabulary is the closed
 * `TaskStatus` / `TaskPriority` enums in `lennix-ms-bk/app/tasks/constants.py`:
 * every write is enum-validated, so no other value can reach a response.
 */
export type TaskStatusDTO = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriorityDTO = 'low' | 'medium' | 'high'

/** POST /v1/tasks/projects/:project_id/tasks — request */
export interface TaskCreateRequestDTO {
  title: string
  description?: string | null
  priority?: string
  budget?: string | null
  is_draft?: boolean
  subtasks?: SubtaskInputDTO[] | null
}

/** Task endpoints — response */
export interface TaskResponseDTO {
  id: string
  project_id: string
  /**
   * The obra's name, alongside its id.
   *
   * Nullable because the backend derives it from an eagerly-loaded
   * relationship and refuses an implicit query when a producer skipped the
   * load — see `Task.project_name` in `lennix-ms-bk`.
   */
  project_name: string | null
  title: string
  description: string | null
  status: TaskStatusDTO
  priority: TaskPriorityDTO
  budget: string | null
  progress: number
  start_date: string | null
  due_date: string | null
  spent: string
  is_over_budget: boolean
  delay_reason: string | null
  delay_days: number
  is_draft: boolean
  is_blocked: boolean
  is_critical_path: boolean
  assignee_id: string | null
  assignee_name: string | null
  force_started: boolean
  /** Permanent force-start provenance — survives the upstream completing. */
  at_risk: boolean
  created_at: string
  subtasks: SubtaskResponseDTO[]
}

/**
 * PUT /v1/tasks/:id — request.
 *
 * Exactly what `TaskUpdateRequest` accepts (`app/tasks/schemas.py`): no
 * progress and no dates — a phase derives both from its subactivities.
 */
export interface TaskUpdateRequestDTO {
  title?: string | null
  description?: string | null
  priority?: string | null
  budget?: string | null
  /** Set to a user_id to assign, or empty string to clear. */
  assignee_id?: string | null
}

/** PATCH /v1/tasks/:id/status — request */
export interface TaskStatusUpdateRequestDTO {
  status: TaskStatusDTO
  delay_reason?: string | null
}

/** PATCH /v1/tasks/:id/budget — request */
export interface TaskBudgetUpdateRequestDTO {
  budget: string
}
