/**
 * DTOs mirroring `app/force_start_requests/schemas.py`.
 *
 * The only way a blocked activity starts is a request someone with
 * `forceStart.approval.decide` approves, and the approval leaves a permanent
 * at-risk mark on the task.
 */

export type ForceStartStateDTO = 'pending' | 'approved' | 'rejected'

export interface ForceStartRequestResponseDTO {
  id: string
  /** The target activity. Subtasks are tasks too on the backend model. */
  task_id: string
  reason: string
  state: ForceStartStateDTO
  requestor_id: string
  decided_by: string | null
  decided_at: string | null
  decision_comment: string | null
  /** Audit snapshot of the task at request time (title, status, is_blocked…). */
  state_snapshot: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ForceStartCreateRequestDTO {
  task_id: string
  reason: string
}

export interface ForceStartDecideRequestDTO {
  decision_comment: string | null
}
