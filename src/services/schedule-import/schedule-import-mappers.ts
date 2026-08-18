/**
 * DTO → domain for the schedule-import surface.
 *
 * The parse report, assumption ledger and quality block arrive as raw JSON:
 * ms-ai owns their shape and ms-bk passes them through unchanged, so an
 * additive parser release must not break this build. That freedom is paid for
 * here — every field is read defensively and normalized ONCE, so components
 * never touch `Record<string, unknown>` and an unexpected payload degrades to a
 * quiet empty value instead of a crashed canvas.
 */

import type {
  AlternativeAction,
  AmbiguityCode,
  AssistedMappingDivert,
  AssumptionLedgerEntry,
  ConsequenceClass,
  DateAssumption,
  DateEvidence,
  DroppedRow,
  ImportFailureCode,
  ImportJob,
  ImportJobStatus,
  ImportUploadResult,
  ParseQuality,
  ParseReport,
  PlanQuotaCode,
  PlanQuotaFailure,
  ReviewDependency,
  ReviewRowSource,
  ReviewSubtask,
  ReviewTask,
  ReviewStep,
  ReviewTaskBudgetsResult,
  ReviewUnresolvedEdge,
  ScheduleReviewState,
  SectionSignal,
  SheetEvidence,
  SheetReasonCode,
  UnclassifiedRow,
  UnknownReviewTasksFailure,
} from '@/types'
import { REVIEW_STEPS } from '@/types'
import type {
  ImportJobStatusResponseDTO,
  ImportUploadResponseDTO,
  ReviewRowSourceDTO,
  ReviewSubtaskDTO,
  ReviewTaskBudgetsResponseDTO,
  ReviewTaskDTO,
  ScheduleReviewStateResponseDTO,
} from '@/types/dto/project-import-dto'
import { parseMoney } from '@/utils'

import type { ApiError } from '../api-injector'

import {
  asArray,
  asRecord,
  bool,
  num,
  optionalNum,
  optionalText,
  stringList,
  text,
  token,
  type Json,
} from './json-coercion'

const AMBIGUITY_CODES: readonly AmbiguityCode[] = [
  'date_format',
  'day_grid_year',
  'locale',
  'sheet_choice',
  'hierarchy_signal',
  'edge_ref',
  // 1.3: the union and the trust copy knew this one; missing here, a rescue
  // contract's ledger entry silently fell back to the date_format sentence.
  'llm_mapping',
]

const ALTERNATIVE_ACTIONS: readonly AlternativeAction[] = [
  'flip_date_order',
  'switch_sheet',
  'group_rows_manually',
  'confirm_edge_candidates',
  'state_the_year',
  'none',
]

const DATE_EVIDENCE: readonly DateEvidence[] = [
  'native_cells',
  'month_names',
  'leading_year',
  'day_over_12_first',
  'day_over_12_second',
  'conflicting_day_positions',
  'column_runs_forward',
  'locale_prior',
  'no_dates_found',
]

const SHEET_REASON_CODES: readonly SheetReasonCode[] = [
  'name_matches_schedule',
  'name_matches_companion',
  'name_neutral',
  'has_schedule_header',
  'has_day_grid',
  'no_schedule_header',
  'no_rows_under_header',
]

function mapSheetEvidence(value: unknown): SheetEvidence {
  const evidence = asRecord(value)
  return {
    codes: stringList(evidence.codes).filter((code): code is SheetReasonCode =>
      (SHEET_REASON_CODES as readonly string[]).includes(code),
    ),
    headerRow: optionalNum(evidence.header_row),
    dayGridColumns: optionalNum(evidence.day_grid_columns),
  }
}

function mapDroppedRow(value: unknown): DroppedRow {
  const row = asRecord(value)
  return {
    sheet: text(row.sheet),
    row: num(row.row),
    text: text(row.text),
    reason: text(row.reason),
  }
}

function mapSectionSignal(value: unknown): SectionSignal {
  const row = asRecord(value)
  return {
    sectionRef: optionalText(row.section_ref),
    sectionName: text(row.section_name),
    signal: text(row.signal),
    rows: num(row.rows),
    mixed: bool(row.mixed),
  }
}

function mapDateAssumption(value: unknown): DateAssumption {
  const row = asRecord(value)
  return {
    column: text(row.column),
    chosen: text(row.chosen),
    alternative: optionalText(row.alternative),
    settledBy: text(row.settled_by),
    settledByCode: token(row.settled_by_code, DATE_EVIDENCE, 'no_dates_found'),
    samples: stringList(row.samples),
    affectedRows: num(row.affected_rows),
  }
}

function mapUnclassifiedRow(value: unknown): UnclassifiedRow {
  const row = asRecord(value)
  return {
    sheet: text(row.sheet),
    row: num(row.row),
    text: text(row.text),
    cause: text(row.cause),
    ref: optionalText(row.ref),
  }
}

export function mapParseReport(value: unknown): ParseReport {
  const report = asRecord(value)
  return {
    rowsScanned: num(report.rows_scanned),
    rowsImported: num(report.rows_imported),
    rowsDropped: num(report.rows_dropped),
    sheetReason: text(report.sheet_reason),
    sheetEvidence: mapSheetEvidence(report.sheet_evidence),
    dropped: asArray(report.dropped).map(mapDroppedRow),
    sectionSignals: asArray(report.section_signals).map(mapSectionSignal),
    dateAssumptions: asArray(report.date_assumptions).map(mapDateAssumption),
    unclassified: asArray(report.unclassified).map(mapUnclassifiedRow),
    unclassifiedTotal: num(report.unclassified_total),
  }
}

export function mapLedgerEntry(value: unknown): AssumptionLedgerEntry {
  const entry = asRecord(value)
  // Anything the parser does not explicitly mark cosmetic is treated as
  // high-consequence: under-stating a caveat is the failure mode this phase
  // refuses (a silent-confident-wrong date must always be counted).
  const consequence: ConsequenceClass =
    text(entry.consequence) === 'cosmetic' ? 'cosmetic' : 'high'
  return {
    cause: token(entry.cause, AMBIGUITY_CODES, 'date_format'),
    scope: text(entry.scope),
    consequence,
    chosen: text(entry.chosen),
    alternativeValue: optionalText(entry.alternative_value),
    alternativeAction: token(
      entry.alternative_action,
      ALTERNATIVE_ACTIONS,
      'none',
    ),
    affectedRows: num(entry.affected_rows),
    sampleRowRefs: stringList(entry.sample_row_refs),
    assumption: text(entry.assumption),
    alternative: optionalText(entry.alternative),
    detail: text(entry.detail),
  }
}

export function mapLedger(value: unknown): AssumptionLedgerEntry[] {
  return asArray(value).map(mapLedgerEntry)
}

export function mapParseQuality(value: unknown): ParseQuality {
  const quality = asRecord(value)
  return {
    resolutionRatio: num(quality.resolution_ratio),
    threshold: num(quality.threshold),
    reasons: stringList(quality.reasons),
    workRows: num(quality.work_rows),
    scheduledRows: num(quality.scheduled_rows),
    detail: text(quality.detail),
  }
}

function mapRowSource(dto: ReviewRowSourceDTO | null): ReviewRowSource | null {
  if (!dto) return null
  return { sheet: dto.sheet, row: dto.row, taskId: dto.task_id }
}

function mapReviewSubtask(dto: ReviewSubtaskDTO): ReviewSubtask {
  return {
    id: dto.id,
    ref: dto.ref,
    title: dto.title,
    description: dto.description,
    startDate: dto.start_date,
    dueDate: dto.due_date,
    progress: dto.progress,
    assigneeId: dto.assignee_id,
    systemGenerated: dto.system_generated,
    edited: dto.edited,
    source: mapRowSource(dto.source),
    sourceParentRef: dto.source_parent_ref,
    depth: dto.depth,
    path: dto.path,
  }
}

function mapReviewTask(dto: ReviewTaskDTO): ReviewTask {
  return {
    id: dto.id,
    ref: dto.ref,
    title: dto.title,
    description: dto.description,
    startDate: dto.start_date,
    dueDate: dto.due_date,
    budget: dto.budget === null ? null : parseMoney(dto.budget),
    progress: dto.progress,
    edited: dto.edited,
    source: mapRowSource(dto.source),
    // The mirror subtask the backend creates for a bare task is a
    // normalization artifact, not something the user uploaded: it never
    // shows up in a review surface.
    subtasks: dto.subtasks
      .filter((subtask) => !subtask.system_generated)
      .map(mapReviewSubtask),
  }
}

export function mapScheduleReviewStateDTO(
  dto: ScheduleReviewStateResponseDTO,
): ScheduleReviewState {
  return {
    project: {
      id: dto.project.id,
      name: dto.project.name,
      description: dto.project.description,
      location: dto.project.location,
      budget:
        dto.project.budget === null ? null : parseMoney(dto.project.budget),
      startDate: dto.project.start_date,
      dueDate: dto.project.due_date,
      isDraft: dto.project.is_draft,
      managerId: dto.project.manager_id,
      // An unknown or absent step degrades to the first station rather than
      // throwing: the field is a hint, and a hint must never break a load.
      reviewStep: token<ReviewStep>(
        dto.project.review_step,
        REVIEW_STEPS,
        'upload',
      ),
    },
    scheduleImport: dto.schedule_import
      ? {
          id: dto.schedule_import.id,
          sourceFilename: dto.schedule_import.source_filename,
          sourceObject: dto.schedule_import.source_object,
          contractVersion: dto.schedule_import.contract_version,
          outcome: dto.schedule_import.outcome,
          sheet: dto.schedule_import.sheet,
          createdAt: dto.schedule_import.created_at,
        }
      : null,
    outcome: dto.outcome,
    report: mapParseReport(dto.report),
    ledger: mapLedger(dto.ledger),
    quality: mapParseQuality(dto.quality),
    tasks: dto.tasks.map(mapReviewTask),
    dependencies: dto.dependencies.map(
      (edge): ReviewDependency => ({
        id: edge.id,
        taskId: edge.task_id,
        dependsOnId: edge.depends_on_id,
        relationshipType: edge.relationship_type,
        lagDays: edge.lag_days,
        source: edge.source,
      }),
    ),
    unresolvedEdges: dto.unresolved_edges.map(
      (edge): ReviewUnresolvedEdge => ({
        successorRef: edge.successor_ref,
        successorTaskId: edge.successor_task_id,
        sourceText: edge.source_text,
        candidates: edge.candidates,
      }),
    ),
    stats: {
      mainTasks: dto.stats.main_tasks,
      subtasks: dto.stats.subtasks,
      dependencies: dto.stats.dependencies,
      unresolvedEdges: dto.stats.unresolved_edges,
      editedTasks: dto.stats.edited_tasks,
      collapsedRows: dto.stats.collapsed_rows,
      maxSourceDepth: dto.stats.max_source_depth,
    },
  }
}

const JOB_STATUSES: readonly ImportJobStatus[] = [
  'uploaded',
  'parsing',
  'draft_ready',
  'needs_assisted_mapping',
  'failed',
]

export function mapImportJobStatusDTO(
  dto: ImportJobStatusResponseDTO,
): ImportJob {
  // An unknown status is treated as `failed` rather than rendered as a schedule:
  // the quality floor exists so a user never lands on a canvas we cannot vouch for.
  const status = JOB_STATUSES.includes(dto.status) ? dto.status : 'failed'
  return {
    id: dto.id,
    status,
    sourceFilename: dto.source_filename,
    organizationId: dto.organization_id,
    projectId: dto.project_id,
    scheduleImportId: dto.schedule_import_id,
    failureCode: dto.failure_code,
    terminal: dto.terminal,
    report: mapParseReport(dto.report),
    ledger: mapLedger(dto.ledger),
    quality: mapParseQuality(dto.quality),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

export function mapImportUploadResponseDTO(
  dto: ImportUploadResponseDTO,
): ImportUploadResult {
  return {
    projectId: dto.project_id,
    fileName: dto.filename,
    importId: dto.import_id ?? null,
    importJobId: dto.import_job_id ?? null,
    outcome: dto.outcome ?? null,
    previousImport: dto.previous_import
      ? {
          importId: dto.previous_import.import_id,
          projectId: dto.previous_import.project_id,
          projectName: dto.previous_import.project_name,
          sourceFilename: dto.previous_import.source_filename,
          isDraft: dto.previous_import.is_draft,
          overlap: dto.previous_import.overlap,
          conflicts: dto.previous_import.conflicts.map((conflict) => ({
            taskId: conflict.task_id,
            ref: conflict.ref,
            title: conflict.title,
            field: conflict.field,
            importedValue: conflict.imported_value,
            currentValue: conflict.current_value,
          })),
        }
      : null,
  }
}

/** The structured error body FastAPI wraps in `detail`. */
function errorDetail(error: unknown): Json {
  const data = asRecord(asRecord(error).data)
  return asRecord(data.detail)
}

const QUOTA_CODES: readonly PlanQuotaCode[] = [
  'plan_project_limit_exceeded',
  'plan_draft_limit_exceeded',
  'plan_storage_limit_exceeded',
]

/**
 * Read ms-bk's structured plan-quota 400.
 *
 * Returns `null` for anything else, so a caller can fall through to its generic
 * error path — hitting a plan ceiling is a normal, nameable event on the hero
 * path and must never surface as "something went wrong".
 */
export function readPlanQuotaFailure(
  error: ApiError | unknown,
): PlanQuotaFailure | null {
  if (asRecord(error).status !== 400) return null
  const detail = errorDetail(error)
  const code = text(detail.code) as PlanQuotaCode
  if (!QUOTA_CODES.includes(code)) return null
  return {
    code,
    limit: typeof detail.limit === 'number' ? detail.limit : null,
    current: num(detail.current),
    message: text(detail.message),
  }
}

/** Read the 422 that diverts an upload to assisted mapping (Lane F). */
export function readAssistedMappingDivert(
  error: ApiError | unknown,
): AssistedMappingDivert | null {
  if (asRecord(error).status !== 422) return null
  const detail = errorDetail(error)
  if (text(detail.code) !== 'needs_assisted_mapping') return null
  const importJobId = text(detail.import_job_id)
  if (!importJobId) return null
  return {
    code: 'needs_assisted_mapping',
    importJobId,
    message: text(detail.message),
  }
}

const IMPORT_FAILURE_CODES: readonly ImportFailureCode[] = [
  'needs_normalization',
  'invalid_file_signature',
  'unsupported_file_type',
  'prompt_injection_detected',
]

/** Read the failure code of a 422 that ended the import job in `failed`. */
export function readImportFailureCode(
  error: ApiError | unknown,
): ImportFailureCode | null {
  if (asRecord(error).status !== 422) return null
  const code = text(errorDetail(error).code) as ImportFailureCode
  return IMPORT_FAILURE_CODES.includes(code) ? code : null
}

/** Money arrives as a string on some fields and a number on others. */
function money(value: string | number | null): number | null {
  if (value === null) return null
  return typeof value === 'number' ? value : parseMoney(value)
}

/**
 * The task-budget write's result. `allocated` is dropped on purpose: it counts
 * live tasks and therefore reads `0` for a draft — the surface sums what it
 * sent instead of repeating a number that would say the opposite.
 */
export function mapReviewTaskBudgetsDTO(
  dto: ReviewTaskBudgetsResponseDTO,
): ReviewTaskBudgetsResult {
  return {
    projectId: dto.project_id,
    projectBudget: money(dto.project_budget),
    tasks: dto.tasks.map((task) => ({
      id: task.id,
      budget: money(task.budget),
    })),
  }
}

/**
 * Read the 400 a task-budget write answers with when an id is not a review
 * task of this draft. The write is all-or-nothing on the backend, so this is
 * also the signal that **nothing** was applied.
 */
export function readUnknownReviewTasks(
  error: ApiError | unknown,
): UnknownReviewTasksFailure | null {
  if (asRecord(error).status !== 400) return null
  const detail = errorDetail(error)
  if (text(detail.code) !== 'unknown_review_tasks') return null
  return {
    code: 'unknown_review_tasks',
    taskIds: stringList(detail.task_ids),
    message: text(detail.message),
  }
}
