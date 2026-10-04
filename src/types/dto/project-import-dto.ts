/**
 * Project-import API DTOs — used by the import mock handlers and mappers.
 *
 * ms-ai's schedule contract lands as a domain draft behind an import job that
 * reports honest status. `report` / `ledger` / `quality` are typed as raw
 * JSON on purpose — bk passes ms-ai's payload through unchanged, so an additive
 * parser release must not break the frontend build.
 */

import type { ImportJobStatus } from '../schedule-import'

import type { DependencySourceDTO, RelationshipTypeDTO } from './dependency-dto'

export interface ImportEditConflictDTO {
  task_id: string
  ref: string
  title: string
  field: string
  imported_value: string | null
  current_value: string | null
}

/** A prior import of the same source document — never overwritten. */
export interface ImportReimportInfoDTO {
  import_id: string
  project_id: string
  project_name: string
  source_filename: string
  is_draft: boolean
  overlap: number
  conflicts: ImportEditConflictDTO[]
}

export interface ImportUploadResponseDTO {
  project_id: string
  filename: string
  import_id?: string | null
  /** The job this upload opened — the handle for `GET /import/jobs/{id}`. */
  import_job_id?: string | null
  outcome?: string | null
  previous_import?: ImportReimportInfoDTO | null
}

export interface ImportJobStatusResponseDTO {
  id: string
  status: ImportJobStatus
  source_filename: string
  organization_id: string
  project_id: string | null
  schedule_import_id: string | null
  failure_code: string | null
  /** Nothing more will happen to this job — the FE stops polling. */
  terminal: boolean
  /** Populated for a diverted upload only: it landed no draft to serve them. */
  report: Record<string, unknown>
  ledger: Record<string, unknown>[]
  quality: Record<string, unknown>
  created_at: string
  updated_at: string
}

/** The 422 body that routes to assisted mapping (Lane F). */
export interface ImportAssistedMappingErrorDTO {
  code: 'needs_assisted_mapping'
  import_job_id: string
  message: string
  quality: Record<string, unknown>
  report: Record<string, unknown>
  ledger: Record<string, unknown>[]
}

/** Where a reviewed row came from in the user's file. */
export interface ReviewRowSourceDTO {
  sheet: string | null
  row: number | null
  task_id: string | null
}

export interface ReviewSubtaskDTO {
  id: string
  ref: string | null
  title: string
  description: string | null
  start_date: string | null
  due_date: string | null
  progress: number
  assignee_id: string | null
  /** The mirror subtask the backend creates for a bare task — hidden by default. Drafts carry none (added at go-live). */
  system_generated: boolean
  edited: boolean
  source: ReviewRowSourceDTO | null
  /** Ref of the row's real parent in the source, before the 2-level collapse. */
  source_parent_ref: string | null
  /** Source depth below the main task: 1 is a direct child, >1 was flattened. */
  depth: number
  /** Ancestor titles the 2-level model flattened, root→leaf; empty when depth is 1. */
  path: string[]
}

export interface ReviewTaskDTO {
  id: string
  ref: string | null
  title: string
  description: string | null
  start_date: string | null
  due_date: string | null
  /** Money as a fixed 2-decimal string; the import never sets one. */
  budget: string | null
  progress: number
  edited: boolean
  source: ReviewRowSourceDTO | null
  subtasks: ReviewSubtaskDTO[]
}

export interface ReviewDependencyDTO {
  id: number
  task_id: string
  depends_on_id: string
  relationship_type: RelationshipTypeDTO
  lag_days: number
  source: DependencySourceDTO
}

/** A predecessor reference no row matched — a question, never an edge. */
export interface ReviewUnresolvedEdgeDTO {
  successor_ref: string
  successor_task_id: string | null
  source_text: string | null
  candidates: string[]
}

export interface ReviewImportDTO {
  id: string
  source_filename: string
  source_object: string | null
  contract_version: string
  outcome: string
  sheet: string | null
  created_at: string
}

export interface ReviewProjectDTO {
  id: string
  name: string
  description: string | null
  location: string | null
  budget: string | null
  start_date: string | null
  due_date: string | null
  is_draft: boolean
  manager_id: string | null
  /** Where the review was left. Advisory — see `resolveReviewStep`. */
  review_step: string | null
}

export interface ReviewStatsDTO {
  main_tasks: number
  subtasks: number
  dependencies: number
  unresolved_edges: number
  edited_tasks: number
  /** Subtasks that sat deeper than one level in the source and were flattened. */
  collapsed_rows: number
  /** Deepest nesting below a phase — 1 is the model's own ceiling. */
  max_source_depth: number
}

/** `GET /v1/schedule/review/{id}` — resumable by id. */
export interface ScheduleReviewStateResponseDTO {
  project: ReviewProjectDTO
  schedule_import: ReviewImportDTO | null
  outcome: string | null
  report: Record<string, unknown>
  ledger: Record<string, unknown>[]
  quality: Record<string, unknown>
  tasks: ReviewTaskDTO[]
  dependencies: ReviewDependencyDTO[]
  unresolved_edges: ReviewUnresolvedEdgeDTO[]
  stats: ReviewStatsDTO
}

/**
 * `POST /v1/schedule/review/{id}/activate` — go-live result, exactly as
 * `execute_import_endpoint` builds it (`app/schedule/import_views.py`).
 */
export interface ImportExecuteResponseDTO {
  project_id: string
  project_name: string
  description: string | null
  location: string | null
  manager_name: string | null
  /** Real uploaded filename from the newest import; null if none was recorded. */
  filename: string | null
  total_tasks: number
  /** A JSON number here (`float(project.budget or 0)`), unlike the string money elsewhere. */
  total_budget: number
  /** Null when the project has no dates yet — no more invented 365-day spans. */
  total_duration_days: number | null
  start_date: string | null
  due_date: string | null
}

/** `PATCH /v1/schedule/review/{id}/step`. */
export interface ReviewStepResponseDTO {
  project_id: string
  review_step: string
}

/**
 * `PATCH /v1/schedule/review/{id}/task-budgets`.
 *
 * `allocated` is deliberately not mapped: it counts live tasks, so it reads `0`
 * for every draft. Rendering it would tell a user who just allocated the whole
 * budget that nothing was assigned.
 */
export interface ReviewTaskBudgetsResponseDTO {
  project_id: string
  project_budget: string | number | null
  allocated: string | number | null
  tasks: { id: string; budget: string | number | null }[]
}
