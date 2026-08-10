/** Subtask input for task creation */
export interface SubtaskInputDTO {
  title: string
  description?: string | null
  priority?: string
  start_date?: string | null
  due_date?: string | null
  location?: string | null
  assignee_id?: string | null
  progress?: number
}

/** Subtask response from API */
export interface SubtaskResponseDTO {
  id: string
  parent_id: string
  title: string
  description: string | null
  status: string
  priority: string
  progress: number
  start_date: string | null
  due_date: string | null
  location: string | null
  assignee_id: string | null
  assignee_name: string | null
  spent: string
  delay_reason: string | null
  delay_days: number
  is_blocked: boolean
  is_critical_path: boolean
  force_started: boolean
  /** Permanent force-start provenance — survives the upstream completing. */
  at_risk: boolean
  /** True for the mirror subtask the backend creates for a bare task. */
  system_generated: boolean
  created_at: string
}

/**
 * `GET /v1/tasks/assigned` — one row of the cross-project "assigned to me" queue.
 *
 * Work is assignable at **both** levels, so a row is either a subactivity or a
 * first-level activity. For the latter `parent_id` and `parent_title` are
 * `null` — there is no phase above it and the obra alone is its context.
 */
export interface AssignedSubtaskResponseDTO extends Omit<
  SubtaskResponseDTO,
  'parent_id'
> {
  parent_id: string | null
  project_id: string
  project_name: string
  parent_title: string | null
}

/** POST /v1/tasks/:task_id/subtasks — request */
export interface SubtaskCreateRequestDTO {
  title: string
  description?: string | null
  priority?: string
  start_date?: string | null
  due_date?: string | null
  location?: string | null
  assignee_id?: string | null
}

/** PUT /v1/tasks/subtasks/:id — request */
export interface SubtaskUpdateRequestDTO {
  title?: string | null
  description?: string | null
  priority?: string | null
  start_date?: string | null
  due_date?: string | null
  location?: string | null
  assignee_id?: string | null
}

/** PATCH /v1/tasks/subtasks/:id/progress — request */
export interface SubtaskProgressUpdateRequestDTO {
  progress: number
  /**
   * Why the activity is running late, from the closed `DelayReason` set.
   *
   * Optional, and **omitted means "keep what is stored"** — ms-bk only writes
   * the field when the request mentions it (`docs/PRODUCT.md`), so a routine
   * report from somebody who was not asked for a cause cannot erase the cause
   * somebody else gave.
   */
  delay_reason?: string
}

/** PATCH /v1/tasks/subtasks/:id/status — request */
export interface SubtaskStatusUpdateRequestDTO {
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  delay_reason?: string | null
}
