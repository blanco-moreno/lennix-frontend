/**
 * Schedule-import domain types.
 *
 * The frontend consumes three backend surfaces: the upload result, the import
 * job state machine and the resumable review state. The trust
 * outputs inside them — parse report, assumption ledger, quality — are produced
 * by ms-ai and passed through ms-bk unchanged, so they are normalized once
 * here (`schedule-import-mappers`) and never re-read as raw JSON by a component.
 */

/** `uploaded → parsing → draft_ready | needs_assisted_mapping | failed` */
export type ImportJobStatus =
  | 'uploaded'
  | 'parsing'
  | 'draft_ready'
  | 'needs_assisted_mapping'
  | 'failed'

/** Where a parsed row came from in the user's file. */
export interface ReviewRowSource {
  sheet: string | null
  row: number | null
  taskId: string | null
}

export interface DroppedRow {
  sheet: string
  row: number
  text: string
  reason: string
}

export interface SectionSignal {
  sectionRef: string | null
  sectionName: string
  signal: string
  rows: number
  mixed: boolean
}

/**
 * The closed vocabularies contract 1.2 speaks. Each union mirrors an enum in
 * `lennix-ms-ai/app/schedule/constants.py`; `trust-copy/` turns each token into user copy.
 */
export type AmbiguityCode =
  | 'date_format'
  | 'day_grid_year'
  | 'locale'
  | 'sheet_choice'
  | 'hierarchy_signal'
  | 'edge_ref'
  // 1.3: the deterministic parse fell through the quality floor and ms-ai's
  // model pass rebuilt the row set — one HIGH entry covering every row.
  | 'llm_mapping'

/** What the reader can do instead. `none` is an answer, not a missing value. */
export type AlternativeAction =
  | 'flip_date_order'
  | 'switch_sheet'
  | 'group_rows_manually'
  | 'confirm_edge_candidates'
  | 'state_the_year'
  | 'none'

/** Every date column the contract can read — wider than the flippable pair. */
export type DateColumnCode =
  | 'start'
  | 'finish'
  | 'actual_start'
  | 'actual_finish'
  | 'constraint_date'

/** What settled a date column's reading. */
export type DateEvidence =
  | 'native_cells'
  | 'month_names'
  | 'leading_year'
  | 'day_over_12_first'
  | 'day_over_12_second'
  | 'conflicting_day_positions'
  | 'column_runs_forward'
  | 'locale_prior'
  | 'no_dates_found'

/** Why a worksheet won or lost the schedule-sheet choice. */
export type SheetReasonCode =
  | 'name_matches_schedule'
  | 'name_matches_companion'
  | 'name_neutral'
  | 'has_schedule_header'
  | 'has_day_grid'
  | 'no_schedule_header'
  | 'no_rows_under_header'

/** Why the chosen sheet won — the machine twin of the prose `sheetReason`. */
export interface SheetEvidence {
  codes: SheetReasonCode[]
  /** Set exactly when `has_schedule_header` is among the codes. */
  headerRow: number | null
  /** Set exactly when `has_day_grid` is among the codes. */
  dayGridColumns: number | null
}

export interface DateAssumption {
  column: string
  chosen: string
  alternative: string | null
  /** PROSE, debug only — never rendered. Compose from `settledByCode`. */
  settledBy: string
  settledByCode: DateEvidence
  samples: string[]
  affectedRows: number
}

export interface UnclassifiedRow {
  sheet: string
  row: number
  text: string
  cause: string
  ref: string | null
}

/** What happened to the file — the checkable receipt behind the narration. */
export interface ParseReport {
  rowsScanned: number
  rowsImported: number
  rowsDropped: number
  /** PROSE, debug only — never rendered. Compose from `sheetEvidence`. */
  sheetReason: string
  sheetEvidence: SheetEvidence
  dropped: DroppedRow[]
  sectionSignals: SectionSignal[]
  dateAssumptions: DateAssumption[]
  unclassified: UnclassifiedRow[]
  unclassifiedTotal: number
}

/** `high` assumptions are the ones the receipt counts as "things to check". */
export type ConsequenceClass = 'high' | 'cosmetic'

/**
 * One assumption Lennix committed to — a cause, never a cell.
 *
 * The six fields above the fold are the whole sentence: `trust-copy` keys a
 * translated template off `cause` and fills it from the rest. `assumption`,
 * `alternative` and `detail` are ms-ai's English prose twins — they exist for
 * debugging and are never rendered.
 */
export interface AssumptionLedgerEntry {
  cause: AmbiguityCode
  /** A `DateColumnCode` for `date_format`, else `'sheet'` or `'edges'`. */
  scope: string
  consequence: ConsequenceClass
  /** A token or a value read off the file — never a sentence. */
  chosen: string
  /** The other reading, when the alternative is a reading rather than an act. */
  alternativeValue: string | null
  alternativeAction: AlternativeAction
  affectedRows: number
  sampleRowRefs: string[]
  /** PROSE, debug only — never rendered. */
  assumption: string
  /** PROSE, debug only — never rendered. */
  alternative: string | null
  /** PROSE, debug only — never rendered. */
  detail: string
}

/** Whether this parse is good enough to render as a schedule (Lane A vs F). */
export interface ParseQuality {
  resolutionRatio: number
  threshold: number
  reasons: string[]
  /** Leaf rows that were supposed to become tasks. */
  workRows: number
  /** How many of those actually landed on a timeline. */
  scheduledRows: number
  /** PROSE, debug only — never rendered. */
  detail: string
}

export interface ImportJob {
  id: string
  status: ImportJobStatus
  sourceFilename: string
  organizationId: string
  projectId: string | null
  scheduleImportId: string | null
  failureCode: string | null
  terminal: boolean
  report: ParseReport
  ledger: AssumptionLedgerEntry[]
  quality: ParseQuality
  createdAt: string
  updatedAt: string
}

export interface ImportEditConflict {
  taskId: string
  ref: string
  title: string
  field: string
  importedValue: string | null
  currentValue: string | null
}

/** A prior import of the same file — it is never overwritten. */
export interface ImportReimportInfo {
  importId: string
  projectId: string
  projectName: string
  sourceFilename: string
  isDraft: boolean
  overlap: number
  conflicts: ImportEditConflict[]
}

export interface ImportUploadResult {
  projectId: string
  fileName: string
  importId: string | null
  importJobId: string | null
  outcome: string | null
  previousImport: ImportReimportInfo | null
}

export interface ReviewSubtask {
  id: string
  ref: string | null
  title: string
  description: string | null
  startDate: string | null
  dueDate: string | null
  progress: number
  assigneeId: string | null
  /** The mirror subtask the backend creates for a bare task — hidden by default; drafts carry none. */
  systemGenerated: boolean
  edited: boolean
  source: ReviewRowSource | null
  /** Ref of the row's real parent in the source, before the 2-level collapse. */
  sourceParentRef: string | null
  /** Source depth below the main task: 1 is a direct child, >1 was flattened. */
  depth: number
  /** Ancestor titles the 2-level model flattened, root→leaf; empty when depth is 1. */
  path: string[]
}

export interface ReviewTask {
  id: string
  ref: string | null
  title: string
  description: string | null
  startDate: string | null
  dueDate: string | null
  budget: number | null
  progress: number
  edited: boolean
  source: ReviewRowSource | null
  subtasks: ReviewSubtask[]
}

export interface ReviewDependency {
  id: number
  taskId: string
  dependsOnId: string
  relationshipType: string
  lagDays: number
  source: string
}

/** A predecessor reference no row matched — a question, never an edge. */
export interface ReviewUnresolvedEdge {
  successorRef: string
  successorTaskId: string | null
  sourceText: string | null
  candidates: string[]
}

export interface ReviewImport {
  id: string
  sourceFilename: string
  sourceObject: string | null
  contractVersion: string
  outcome: string
  sheet: string | null
  createdAt: string
}

/**
 * The wizard's four stations. Order is meaningful: a later step is further
 * along, which is what makes "furthest reachable" a comparison and not a table.
 */
export const REVIEW_STEPS = ['upload', 'schedule', 'budget', 'confirm'] as const

export type ReviewStep = (typeof REVIEW_STEPS)[number]

export interface ReviewProject {
  id: string
  name: string
  description: string | null
  location: string | null
  budget: number | null
  startDate: string | null
  dueDate: string | null
  isDraft: boolean
  managerId: string | null
  /**
   * Where the review was left, as the backend remembers it — **advisory**.
   *
   * It exists so a review resumed on another device lands where it was left.
   * It is never authority over the draft's real state: see
   * `resolveReviewStep` for the precedence and the clamp.
   */
  reviewStep: ReviewStep
}

export interface ReviewStats {
  mainTasks: number
  subtasks: number
  dependencies: number
  unresolvedEdges: number
  editedTasks: number
  /** Subtasks that sat deeper than one level in the source and were flattened. */
  collapsedRows: number
  /** Deepest nesting below a phase — 1 is the model's own ceiling. */
  maxSourceDepth: number
}

/** The draft as it stands right now — resumable by id, days later. */
export interface ScheduleReviewState {
  project: ReviewProject
  scheduleImport: ReviewImport | null
  outcome: string | null
  report: ParseReport
  ledger: AssumptionLedgerEntry[]
  quality: ParseQuality
  tasks: ReviewTask[]
  dependencies: ReviewDependency[]
  unresolvedEdges: ReviewUnresolvedEdge[]
  stats: ReviewStats
}

/**
 * What a review correction may change on a phase row.
 *
 * The review edits the schedule, not the project's administration: budgets,
 * assignees and statuses belong to the live project — a draft has no work to
 * assign yet. A phase carries no dates of its own: `PUT /v1/tasks/:id`
 * (`TaskUpdateRequest`) accepts none, because a phase derives them from its
 * subactivities.
 */
export interface ReviewTaskPatch {
  title?: string
  description?: string | null
}

/**
 * A subactivity correction adds the two dates the schedule actually stores
 * (`PUT /v1/tasks/subtasks/:id`, `SubtaskUpdateRequest`).
 */
export interface ReviewSubtaskPatch extends ReviewTaskPatch {
  start_date?: string | null
  due_date?: string | null
}

/**
 * The optional project fields go-live may carry (`ExecuteImportRequest`).
 *
 * Every key is optional and **absence is the signal**: ms-bk applies each one
 * only when it arrives non-null (`if data.name is not None: …`,
 * `app/projects/views.py`), so an untouched field must be omitted rather than
 * sent as `''` or `0` — either would overwrite what the import already produced.
 */
export interface ProjectActivationDetails {
  name?: string
  description?: string
  location?: string
  budget?: number
  /**
   * How the project budget is split across the main tasks.
   *
   * Go-live is the **one** path allowed to overdraw the wallet: ms-bk applies
   * these without the unallocated check every other budget path enforces
   * (`docs/PRODUCT.md`), so the parts may exceed the whole. The review
   * *states* an overrun; it never blocks Activate on it.
   */
  task_budgets?: TaskBudgetAllocation[]
}

/** One activity's share of the project budget, as `ExecuteImportRequest` reads it. */
export interface TaskBudgetAllocation {
  task_id: string
  budget: number
}

/**
 * `PATCH /v1/schedule/review/{id}/task-budgets` — the budget step's own write.
 *
 * `allocated` counts **live** tasks, so it is `0` for the whole time a draft is
 * a draft. The surface never renders it: it sums what it just sent instead.
 */
export interface ReviewTaskBudgetsResult {
  projectId: string
  projectBudget: number | null
  tasks: { id: string; budget: number | null }[]
}

/** The 400 a task-budget write answers with when an id is not a review task. */
export interface UnknownReviewTasksFailure {
  code: 'unknown_review_tasks'
  taskIds: string[]
  message: string
}

/** Go-live result (`POST /v1/schedule/review/{id}/activate`). */
export interface ActivateScheduleResult {
  projectId: string
  projectName: string
  totalTasks: number
  startDate: string | null
  dueDate: string | null
}

/** The machine-readable plan-quota failures ms-bk raises. */
export type PlanQuotaCode =
  | 'plan_project_limit_exceeded'
  | 'plan_draft_limit_exceeded'

export interface PlanQuotaFailure {
  code: PlanQuotaCode
  limit: number | null
  current: number
  message: string
}

/** Why a 422 upload landed the job in `failed`; ms-bk's closed set. */
export type ImportFailureCode =
  | 'needs_normalization'
  | 'invalid_file_signature'
  | 'unsupported_file_type'
  | 'prompt_injection_detected'

/** The 422 that routes an upload to assisted mapping (Lane F). */
export interface AssistedMappingDivert {
  code: 'needs_assisted_mapping'
  importJobId: string
  message: string
}
