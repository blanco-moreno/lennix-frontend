/** PDM relationship types. Predecessor → successor. */
export type RelationshipTypeDTO = 'FS' | 'SS' | 'FF' | 'SF'

/** POST /v1/tasks/:task_id/dependencies — request */
export interface TaskDependencyCreateRequestDTO {
  depends_on_id: string
  dependency_type: string
  /** Defaults to FS server-side when omitted. */
  relationship_type?: RelationshipTypeDTO
  /** Negative = lead. Defaults to 0 server-side. */
  lag_days?: number
}

/** PATCH /v1/tasks/:task_id/dependencies/:dep_id — request */
export interface TaskDependencyUpdateRequestDTO {
  relationship_type?: RelationshipTypeDTO
  lag_days?: number
}

/** Task dependency — response */
export interface TaskDependencyResponseDTO {
  id: number
  task_id: string
  depends_on_id: string
  dependency_type: string
  relationship_type: RelationshipTypeDTO
  lag_days: number
  created_at: string
}

/** Node task summary in dependency graph */
export interface DependencyNodeTaskDTO {
  id: string
  title: string
  status: string
  priority: string
  progress: number
  start_date: string | null
  due_date: string | null
  /** Closed `DelayReason` set; `null` = no cause recorded. */
  delay_reason: string | null
  delay_days: number
  is_blocked: boolean
  /** `is_blocked` already reads AND-NOT-this; it is provenance, not the gate. */
  force_started: boolean
}

/** Edge in dependency graph */
export interface DependencyNodeDTO {
  id: string
  task: DependencyNodeTaskDTO
  /** Null when the predecessor is gone entirely — the edge points nowhere. */
  depends_on: DependencyNodeTaskDTO | null
  relationship_type: RelationshipTypeDTO
  lag_days: number
  /** Predecessor soft-deleted or dangling; a re-link is the only fix. */
  is_broken: boolean
}

/** GET /v1/tasks/projects/:project_id/dependencies — response */
export interface DependencyChainResponseDTO {
  inter_phase: DependencyNodeDTO[]
  intra_phase: Record<string, DependencyNodeDTO[]>
}
