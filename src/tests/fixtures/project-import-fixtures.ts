/**
 * `/v1/schedule` import/review responses, built on the seeded pending draft
 * (`Ampliacion Bodega Logistica (Borrador)`). Applies the same contract→domain
 * rules as `lennix-ms-bk/app/schedule_import/mapping.py`, which is part of the
 * seed-manifest digest — a rule change invalidates this fixture set.
 */

import {
  SEED_IDS,
  SEED_IMPORT_JOB,
  SEED_P8_SCHEDULE_IMPORT,
  SEED_SCHEDULE_IMPORT,
} from '@/tests/seed'
import type {
  SeedContractEdge,
  SeedContractRow,
  SeedScheduleImport,
} from '@/tests/seed'
import type { RelationshipTypeDTO } from '@/types/dto/dependency-dto'
import type {
  ImportAssistedMappingErrorDTO,
  ImportExecuteResponseDTO,
  ImportJobStatusResponseDTO,
  ImportUploadResponseDTO,
  ReviewDependencyDTO,
  ReviewRowSourceDTO,
  ReviewSubtaskDTO,
  ReviewTaskDTO,
  ReviewUnresolvedEdgeDTO,
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

function sourceOf(row: SeedContractRow): ReviewRowSourceDTO {
  return {
    sheet: row.source.sheet,
    row: row.source.row,
    task_id: row.source.task_id,
  }
}

/** One seeded import's contract, landed as review rows on its seeded ids. */
function reviewTasksOf(seeded: SeedScheduleImport): ReviewTaskDTO[] {
  const rows = seeded.contract.rows
  const byRef = new Map(rows.map((row) => [row.ref, row]))

  const taskIdOf = (ref: string): string => {
    const id = seeded.taskIdByRef[ref]
    if (id === undefined)
      throw new Error(
        `contract row '${ref}' has no seeded task id — run \`pnpm seed:sync\` ` +
          'and update the fixture that referenced it.',
      )
    return id
  }

  /** `_root_refs()`: arbitrary depth collapses onto main task → subtask. */
  const rootRefOf = (row: SeedContractRow): string => {
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
  const collapsedAncestors = (row: SeedContractRow): SeedContractRow[] => {
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

  /** `_progress()`: main tasks derive theirs from their subtasks. */
  const progressOf = (row: SeedContractRow): number => {
    if (isMain(row) || row.percent_complete === null) return 0
    return Math.min(Math.max(row.percent_complete, 0), 100)
  }

  const toReviewSubtask = (row: SeedContractRow): ReviewSubtaskDTO => {
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

  return rows.filter(isMain).map(
    (row): ReviewTaskDTO => ({
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
      subtasks: rows
        .filter((child) => !isMain(child) && rootRefOf(child) === row.ref)
        .map(toReviewSubtask),
    }),
  )
}

// The review state and import job surfaces

const RESOLVED = ['id', 'name']
const RELATIONSHIP_TYPES: readonly RelationshipTypeDTO[] = [
  'FS',
  'SS',
  'FF',
  'SF',
]
/** `MAX_LAG_DAYS` — a lag past it never becomes an edge. */
const MAX_LAG_DAYS = 365

/** Python's `round()`: a half goes to the even neighbour. */
function roundHalfEven(value: number): number {
  const rounded = Math.round(value)
  return Math.abs(value % 1) === 0.5 && rounded % 2 !== 0
    ? rounded - 1
    : rounded
}

/** `_lag_days()`: whole working days on an 8-hour day and a 40-hour week. */
function lagDaysOf(edge: SeedContractEdge): number {
  if (edge.lag_unit === 'weeks') return roundHalfEven((edge.lag * 40) / 8)
  if (edge.lag_unit === 'hours') return roundHalfEven(edge.lag / 8)
  return roundHalfEven(edge.lag)
}

/**
 * `map_contract_to_draft()` and the landing: an edge resolved to two rows of
 * the file, stated once, with a known type and a lag inside the bound, lands
 * tagged `project_import`. Postgres numbers the rows; the fixture numbers them
 * in contract order.
 */
function reviewDependenciesOf(
  seeded: SeedScheduleImport,
): ReviewDependencyDTO[] {
  const seen = new Set<string>()
  return seeded.contract.edges.flatMap((edge) => {
    const successor = seeded.taskIdByRef[edge.successor_ref]
    const predecessor = seeded.taskIdByRef[edge.predecessor_ref]
    const type = RELATIONSHIP_TYPES.find(
      (known) => known === edge.type.toUpperCase(),
    )
    const lag = lagDaysOf(edge)
    const pair = `${edge.successor_ref}→${edge.predecessor_ref}`
    if (
      !RESOLVED.includes(edge.resolution) ||
      !successor ||
      !predecessor ||
      successor === predecessor ||
      seen.has(pair) ||
      !type ||
      Math.abs(lag) > MAX_LAG_DAYS
    )
      return []
    seen.add(pair)
    return [
      {
        id: seen.size,
        task_id: successor,
        depends_on_id: predecessor,
        relationship_type: type,
        lag_days: lag,
        source: 'project_import',
      },
    ]
  })
}

/** A reference the parser could only guess at is a question, never an edge. */
function unresolvedEdgesOf(
  seeded: SeedScheduleImport,
): ReviewUnresolvedEdgeDTO[] {
  return seeded.contract.edges
    .filter((edge) => !RESOLVED.includes(edge.resolution))
    .map((edge) => ({
      successor_ref: edge.successor_ref,
      successor_task_id: seeded.taskIdByRef[edge.successor_ref] ?? null,
      source_text: edge.source_text,
      candidates: [...edge.candidates],
    }))
}

/** The review state a seeded import serves, graph included. */
function reviewStateOf(
  seeded: SeedScheduleImport,
): ScheduleReviewStateResponseDTO {
  const project = seedProject(seeded.projectId)
  const tasks = reviewTasksOf(seeded)
  const dependencies = reviewDependenciesOf(seeded)
  const unresolved_edges = unresolvedEdgesOf(seeded)
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
      id: seeded.id,
      source_filename: seeded.sourceFilename,
      source_object: seeded.sourceObject,
      contract_version: seeded.contractVersion,
      outcome: seeded.outcome,
      sheet: seeded.sheet,
      created_at: FIXTURE_CREATED_AT,
    },
    outcome: seeded.outcome,
    // Served from the immutable contract, so the explanation never drifts.
    report: seeded.contract.report,
    ledger: [...seeded.contract.ledger],
    quality: seeded.contract.quality,
    tasks,
    dependencies,
    unresolved_edges,
    stats: {
      main_tasks: tasks.length,
      subtasks: tasks.reduce((total, task) => total + task.subtasks.length, 0),
      dependencies: dependencies.length,
      unresolved_edges: unresolved_edges.length,
      edited_tasks: 0,
      collapsed_rows: subtaskDepths.filter((depth) => depth > 1).length,
      max_source_depth: Math.max(1, ...subtaskDepths),
    },
  }
}

/**
 * `GET /v1/schedule/review/:id` — resumable by id. A hand-made Gantt carries
 * no predecessor column: the human owns the graph, so it lands empty.
 */
export function seedImportReviewStateDTO(): ScheduleReviewStateResponseDTO {
  return reviewStateOf(SEED_SCHEDULE_IMPORT)
}

/**
 * The MS Project draft (project 8): its parsed edges, and the relationships the
 * report names as skipped (contract 2.2).
 */
export function seedP8ImportReviewStateDTO(): ScheduleReviewStateResponseDTO {
  return reviewStateOf(SEED_P8_SCHEDULE_IMPORT)
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
    total_tasks: reviewTasksOf(SEED_SCHEDULE_IMPORT).length,
    total_budget: Number(project.budget ?? 0),
    total_duration_days: durationDays(project.startDate, project.dueDate),
    // The import contract always dates a draft; the seeded draft always has both.
    start_date: project.startDate ?? '',
    due_date: project.dueDate ?? '',
  }
}
