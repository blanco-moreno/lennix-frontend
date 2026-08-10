/**
 * `/v1/schedule` import/review responses, built on the seeded pending draft
 * (`Ampliacion Bodega Logistica (Borrador)`). Applies the same contract→domain
 * rules as `lennix-ms-bk/app/schedule_import/mapping.py`, which is part of the
 * seed-manifest digest — a rule change invalidates this fixture set.
 */

import { SEED_IDS, SEED_IMPORT_JOB, SEED_SCHEDULE_IMPORT } from '@/tests/seed'
import type { SeedContractRow } from '@/tests/seed'
import type {
  ImportAssistedMappingErrorDTO,
  ImportExecuteResponseDTO,
  ImportJobStatusResponseDTO,
  ImportUploadResponseDTO,
  ReviewRowSourceDTO,
  ReviewSubtaskDTO,
  ReviewTaskDTO,
  ScheduleReviewStateResponseDTO,
} from '@/types/dto/project-import-dto'

import { FIXTURE_CREATED_AT, seedProject, seedUserName } from './seed-lookup'

/** The uploaded file is not a seed fact — the draft only records its result. */
export const FIXTURE_IMPORT_FILENAME = SEED_SCHEDULE_IMPORT.sourceFilename

const DRAFT_PROJECT_ID = SEED_IDS.PROJECT_DRAFT_ID
const CONTRACT = SEED_SCHEDULE_IMPORT.contract

/**
 * A diverted upload leaves no draft, so the seed has no row for one. This id is
 * a fixture concern (like `FIXTURE_CREATED_AT`), not a seed fact — it exists so
 * Lane F has a job to resolve.
 */
export const FIXTURE_DIVERTED_JOB_ID = 'e0000000-00ff-00ff-0000-000000000000'

// Contract → draft, mirroring `mapping.py`

function taskIdOf(ref: string): string {
  const id = SEED_SCHEDULE_IMPORT.taskIdByRef[ref]
  if (id === undefined)
    throw new Error(
      `contract row '${ref}' has no seeded task id — run \`pnpm seed:sync\` ` +
        'and update the fixture that referenced it.',
    )
  return id
}

/** `_root_refs()`: arbitrary depth collapses onto main task → subtask. */
function rootRefOf(row: SeedContractRow): string {
  const byRef = new Map(CONTRACT.rows.map((r) => [r.ref, r]))
  const seen = new Set([row.ref])
  let current = row.ref
  for (;;) {
    const parent = byRef.get(current)?.parent_ref
    if (!parent || !byRef.has(parent)) break
    if (seen.has(parent)) return row.ref // a cycle costs structure, never a row
    seen.add(parent)
    current = parent
  }
  return current
}

const isMain = (row: SeedContractRow) => rootRefOf(row) === row.ref

/** The ancestors the 2-level collapse flattened: root main (exclusive) → parent, root→leaf. */
function collapsedAncestors(row: SeedContractRow): SeedContractRow[] {
  const byRef = new Map(CONTRACT.rows.map((r) => [r.ref, r]))
  const rootRef = rootRefOf(row)
  const chain: SeedContractRow[] = []
  const seen = new Set([row.ref])
  let current = row.parent_ref ? byRef.get(row.parent_ref) : undefined
  while (current && current.ref !== rootRef && !seen.has(current.ref)) {
    chain.unshift(current)
    seen.add(current.ref)
    current = current.parent_ref ? byRef.get(current.parent_ref) : undefined
  }
  return chain
}

/** `build_context_description()`: what the domain model has no column for. */
function contextDescription(row: SeedContractRow): string | null {
  const parts: string[] = []
  if (row.resources) parts.push(`Resources: ${row.resources}`)
  if (row.quantity)
    parts.push(`Quantity: ${row.quantity}${row.unit ? ` ${row.unit}` : ''}`)
  if (row.duration_days !== null)
    parts.push(`Duration: ${row.duration_days} days`)
  if (row.percent_complete !== null)
    parts.push(`Progress: ${row.percent_complete}%`)
  if (row.is_milestone) parts.push('Milestone')
  if (row.is_loe) parts.push('Level of effort')
  if (row.calendar_ref) parts.push(`Calendar: ${row.calendar_ref}`)
  return parts.length > 0 ? parts.join('; ') : null
}

/** `_progress()`: main tasks derive theirs from their subtasks. */
function progressOf(row: SeedContractRow): number {
  if (isMain(row) || row.percent_complete === null) return 0
  return Math.min(Math.max(row.percent_complete, 0), 100)
}

function sourceOf(row: SeedContractRow): ReviewRowSourceDTO {
  return {
    sheet: row.source.sheet,
    row: row.source.row,
    task_id: row.source.task_id,
  }
}

const mainRows = () => CONTRACT.rows.filter(isMain)
const childRowsOf = (ref: string) =>
  CONTRACT.rows.filter((row) => !isMain(row) && rootRefOf(row) === ref)

function toReviewSubtask(row: SeedContractRow): ReviewSubtaskDTO {
  const path = collapsedAncestors(row).map((ancestor) => ancestor.name)
  return {
    id: taskIdOf(row.ref),
    ref: row.ref,
    title: row.name,
    description: contextDescription(row),
    start_date: row.start,
    due_date: row.finish,
    progress: progressOf(row),
    // No seeded resource matches an org member, so nothing is assigned.
    assignee_id: null,
    // Drafts carry no mirror subtask (the one the backend creates for a bare
    // task): the invariant is enforced at go-live.
    system_generated: false,
    // The seed lands the draft and stops — nothing was reviewed yet.
    edited: false,
    source: sourceOf(row),
    source_parent_ref: row.parent_ref,
    depth: path.length + 1,
    path,
  }
}

function toReviewTask(row: SeedContractRow): ReviewTaskDTO {
  return {
    id: taskIdOf(row.ref),
    ref: row.ref,
    title: row.name,
    description: contextDescription(row),
    start_date: row.start,
    due_date: row.finish,
    // The wallet is set during review, never guessed from the file.
    budget: null,
    progress: progressOf(row),
    edited: false,
    source: sourceOf(row),
    subtasks: childRowsOf(row.ref).map(toReviewSubtask),
  }
}

// The review state and import job surfaces

/** `GET /v1/schedule/review/:id` — resumable by id. */
export function seedImportReviewStateDTO(): ScheduleReviewStateResponseDTO {
  const project = seedProject(DRAFT_PROJECT_ID)
  const tasks = mainRows().map(toReviewTask)
  const subtaskDepths = tasks.flatMap((task) =>
    task.subtasks.map((subtask) => subtask.depth),
  )
  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      location: project.location,
      budget:
        project.budget === null ? null : Number(project.budget).toFixed(2),
      start_date: project.startDate,
      due_date: project.dueDate,
      is_draft: project.isDraft,
      manager_id: project.managerId,
      // The seed lands the draft and stops: the review was left where the
      // upload left it, which is the first station.
      review_step: 'upload',
    },
    schedule_import: {
      id: SEED_SCHEDULE_IMPORT.id,
      source_filename: SEED_SCHEDULE_IMPORT.sourceFilename,
      source_object: SEED_SCHEDULE_IMPORT.sourceObject,
      contract_version: SEED_SCHEDULE_IMPORT.contractVersion,
      outcome: SEED_SCHEDULE_IMPORT.outcome,
      sheet: SEED_SCHEDULE_IMPORT.sheet,
      created_at: FIXTURE_CREATED_AT,
    },
    outcome: SEED_SCHEDULE_IMPORT.outcome,
    // Served from the immutable contract, so the explanation never drifts.
    report: CONTRACT.report,
    ledger: [...CONTRACT.ledger],
    quality: CONTRACT.quality,
    tasks,
    // A hand-made Gantt carries no predecessor column: the human owns the
    // graph, so there is nothing to resolve either.
    dependencies: [],
    unresolved_edges: [],
    stats: {
      main_tasks: tasks.length,
      subtasks: tasks.reduce((total, task) => total + task.subtasks.length, 0),
      dependencies: 0,
      unresolved_edges: 0,
      edited_tasks: 0,
      collapsed_rows: subtaskDepths.filter((depth) => depth > 1).length,
      max_source_depth: Math.max(1, ...subtaskDepths),
    },
  }
}

/** `GET /v1/schedule/import/jobs/:id` — the job that landed the seeded draft. */
export function seedImportJobStatusDTO(): ImportJobStatusResponseDTO {
  return {
    id: SEED_IMPORT_JOB.id,
    status: 'draft_ready',
    source_filename: SEED_IMPORT_JOB.sourceFilename,
    organization_id: SEED_IMPORT_JOB.organizationId,
    project_id: SEED_IMPORT_JOB.projectId,
    schedule_import_id: SEED_IMPORT_JOB.scheduleImportId,
    failure_code: null,
    terminal: true,
    // A landed draft serves the trust outputs from its review state; the job
    // carries them only when it diverted (the backend leaves these empty here).
    report: {},
    ledger: [],
    quality: {},
    created_at: FIXTURE_CREATED_AT,
    updated_at: FIXTURE_CREATED_AT,
  }
}

/**
 * The same job as it would look for a file the quality floor diverted:
 * no draft, and the parse report + assumption ledger travel on the job itself,
 * because Lane F has nothing else to read them from.
 */
export function seedDivertedImportJobStatusDTO(): ImportJobStatusResponseDTO {
  return {
    ...seedImportJobStatusDTO(),
    id: FIXTURE_DIVERTED_JOB_ID,
    status: 'needs_assisted_mapping',
    project_id: null,
    schedule_import_id: null,
    report: CONTRACT.report,
    ledger: [...CONTRACT.ledger],
    quality: CONTRACT.quality,
  }
}

/** The 422 body that routes an upload to assisted mapping. */
export function seedImportAssistedMappingErrorDTO(): ImportAssistedMappingErrorDTO {
  return {
    code: 'needs_assisted_mapping',
    import_job_id: FIXTURE_DIVERTED_JOB_ID,
    message:
      "This file didn't resolve into a schedule. Map its columns manually to continue.",
    quality: CONTRACT.quality,
    report: CONTRACT.report,
    ledger: [...CONTRACT.ledger],
  }
}

// Upload / preview / execute

export function seedImportUploadDTO(): ImportUploadResponseDTO {
  return {
    project_id: DRAFT_PROJECT_ID,
    filename: FIXTURE_IMPORT_FILENAME,
    import_id: SEED_SCHEDULE_IMPORT.id,
    import_job_id: SEED_IMPORT_JOB.id,
    outcome: SEED_SCHEDULE_IMPORT.outcome,
    // The seeded file was imported once; nothing to warn about.
    previous_import: null,
  }
}

function durationDays(start: string | null, due: string | null): number {
  if (!start || !due) return 0
  const ms = new Date(due).getTime() - new Date(start).getTime()
  return Math.round(ms / 86_400_000)
}

/** Go-live result for the seeded draft — the shape `execute_import_endpoint` returns. */
export function seedImportExecuteDTO(): ImportExecuteResponseDTO {
  const project = seedProject(DRAFT_PROJECT_ID)
  return {
    project_id: project.id,
    project_name: project.name,
    description: project.description,
    location: project.location,
    manager_name: seedUserName(project.managerId),
    filename: FIXTURE_IMPORT_FILENAME,
    total_tasks: mainRows().length,
    total_budget: Number(project.budget ?? 0),
    total_duration_days: durationDays(project.startDate, project.dueDate),
    // The import contract always dates a draft; the seeded draft always has both.
    start_date: project.startDate ?? '',
    due_date: project.dueDate ?? '',
  }
}
