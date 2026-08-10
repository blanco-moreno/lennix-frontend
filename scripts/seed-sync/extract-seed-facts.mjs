/**
 * Extracts the canonical `lennix_pro` demo dataset out of the **backend seed**
 * (`lennix-ms-bk/app/seeds/lennix_pro/*`) so the frontend fixtures and MSW
 * mocks can be *derived* from it instead of hand-copied.
 *
 * Consumers:
 *   - `sync-seed-manifest.mjs` — writes `src/tests/seed/lennix-pro-seed.generated.ts`
 *   - `src/tests/seed/seed-sync.test.ts` — fails when the checked-in manifest
 *     drifts from the seed (the anti-drift gate the fixtures rely on)
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  evaluateModuleAssignments,
  parseCallSites,
  parseSignature,
  parseStrEnum,
  PythonExprParser,
} from './python-literal.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FRONTEND_ROOT = path.resolve(HERE, '../..')

const SEED_DIR = 'app/seeds/lennix_pro'

/** Every backend file the manifest is derived from — also what the digest covers. */
export const SEED_SOURCE_FILES = [
  'app/seeds/foundation/01_roles.py',
  'app/seeds/foundation/02_plans.py',
  `${SEED_DIR}/constants.py`,
  `${SEED_DIR}/01_users.py`,
  `${SEED_DIR}/02_organizations.py`,
  `${SEED_DIR}/03_projects.py`,
  `${SEED_DIR}/04_tasks_and_subtasks.py`,
  `${SEED_DIR}/05_dependencies.py`,
  `${SEED_DIR}/06_expenses.py`,
  `${SEED_DIR}/08_subtask_notes.py`,
  `${SEED_DIR}/10_enterprise_terms.py`,
  `${SEED_DIR}/11_broken_dependency.py`,
  `${SEED_DIR}/13_force_start.py`,
  `${SEED_DIR}/15_schedule_import.py`,
  'app/force_start_requests/constants.py',
  // Not a seed file, but the contract→draft rules the import fixtures mirror
  // when they turn the seeded contract into tasks. A change here changes what
  // the API serves for the seeded draft, so it must invalidate the manifest.
  'app/schedule/mapping.py',
  // Also not a seed file: the seeded draft names its review step by enum
  // member, so the extractor has to resolve `ReviewStep.*` to read the
  // projects at all.
  'app/schedule/constants.py',
]

/**
 * Locates the `lennix-ms-bk` checkout. Order: explicit argument →
 * `LENNIX_MS_BK_PATH` → the sibling directory used by the dev setup.
 *
 * @returns {string | null} absolute path, or null when the backend is not
 *   available (a frontend-only CI checkout).
 */
export function resolveMsBkRoot(explicit) {
  const candidates = [
    explicit,
    process.env.LENNIX_MS_BK_PATH,
    path.resolve(FRONTEND_ROOT, '../lennix-ms-bk'),
  ].filter(Boolean)
  for (const candidate of candidates) {
    const root = path.resolve(candidate)
    if (existsSync(path.join(root, SEED_DIR, 'constants.py'))) return root
  }
  return null
}

const pad = (n) => String(n).padStart(2, '0')

function baseCalls() {
  return {
    'uuid.UUID': ([value]) => value,
    Decimal: ([value]) => String(value),
    date: ([y, m, d]) => `${y}-${pad(m)}-${pad(d)}`,
    datetime: ([y, mo, d, h = 0, mi = 0, s = 0]) =>
      `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}Z`,
    str: ([value]) => String(value),
    list: ([value]) => [...value],
  }
}

/** Applies Python call semantics (positional then keyword then defaults). */
function bindArguments(signature, args, kwargs) {
  /** @type {Record<string, unknown>} */
  const bound = { ...signature.defaults }
  args.forEach((value, index) => {
    bound[signature.names[index]] = value
  })
  return { ...bound, ...kwargs }
}

function readSource(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8')
}

/** Guards a value the seed encodes in code we do not parse (a literal in a body). */
function assertLiteral(src, snippet, where) {
  if (!src.includes(snippet))
    throw new Error(
      `seed drift: expected ${JSON.stringify(snippet)} in ${where}. ` +
        'The extractor mirrors that literal — update scripts/seed-sync when the seed changes.',
    )
}

/**
 * @returns the full set of facts the frontend fixtures mirror.
 */
export function extractSeedFacts(msBkRoot) {
  const read = (file) => readSource(msBkRoot, file)
  const calls = baseCalls()

  // ── Canonical IDs ─────────────────────────────────────────────────────
  const constantsSrc = read(`${SEED_DIR}/constants.py`)
  const { assigned: constantIds } = evaluateModuleAssignments(constantsSrc, {
    calls,
  })

  const ids = { ...constantIds }
  for (const [name, value] of Object.entries(ids)) {
    if (typeof value !== 'string' || !/^[0-9a-f-]{36}$/.test(value))
      throw new Error(`seed constant ${name} is not a UUID string: ${value}`)
  }

  const symbols = { ...ids, UTC: 'UTC' }

  // ── Reference data (foundation seeds) ─────────────────────────────────
  const roles = requireList(
    evaluateModuleAssignments(read('app/seeds/foundation/01_roles.py'), {
      calls,
    }).assigned.ROLES_DATA,
    'ROLES_DATA',
  )
  const plans = requireList(
    evaluateModuleAssignments(read('app/seeds/foundation/02_plans.py'), {
      calls,
    }).assigned.PLANS_DATA,
    'PLANS_DATA',
  ).map((plan) => ({
    id: plan.id,
    name: plan.name,
    maxTeamSize: plan.max_team_size,
    maxProjects: plan.max_projects,
    maxDraftProjects: plan.max_draft_projects,
    storageMb: plan.storage_mb,
    aiRequests: plan.ai_requests,
  }))

  // ── Enterprise terms (inert until the org moves to plan 3) ────────────
  const termsData = requireValue(
    evaluateModuleAssignments(read(`${SEED_DIR}/10_enterprise_terms.py`), {
      symbols,
      calls,
    }).assigned.TERMS_DATA,
    'TERMS_DATA',
  )
  const enterpriseTerms = {
    organizationId: termsData.organization_id,
    maxTeamSize: termsData.max_team_size,
    maxProjects: termsData.max_projects,
    storageMb: termsData.storage_mb,
    aiRequests: termsData.ai_requests,
    contractStart: termsData.contract_start,
    notes: termsData.notes,
  }

  // ── Users ─────────────────────────────────────────────────────────────
  const usersSrc = read(`${SEED_DIR}/01_users.py`)
  const users = requireList(
    evaluateModuleAssignments(usersSrc, { symbols, calls }).assigned.USERS_DATA,
    'USERS_DATA',
  ).map((user) => ({
    userId: user.user_id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    roleId: user.role_id,
  }))

  // ── Organization ──────────────────────────────────────────────────────
  const orgSrc = read(`${SEED_DIR}/02_organizations.py`)
  const orgModule = evaluateModuleAssignments(orgSrc, {
    symbols,
    calls,
  }).assigned
  const orgData = requireValue(orgModule.ORG_DATA, 'ORG_DATA')
  const organization = {
    id: orgData.id,
    name: orgData.name,
    slug: orgData.slug,
    planId: orgData.plan_id,
    ownerId: orgData.owner_id,
    members: requireList(orgModule.MEMBERS_DATA, 'MEMBERS_DATA').map((m) => ({
      userId: m.user_id,
    })),
  }

  // ── Projects ──────────────────────────────────────────────────────────
  const projectsSrc = read(`${SEED_DIR}/03_projects.py`)
  const projectsModule = evaluateModuleAssignments(projectsSrc, {
    // The seeded draft says where its review was left as `ReviewStep.BUDGET`,
    // so the enum has to be in scope or the whole list fails to evaluate.
    symbols: {
      ...symbols,
      ...parseStrEnum(read('app/schedule/constants.py'), 'ReviewStep'),
    },
    calls,
  }).assigned
  const projectMembers = requireValue(
    projectsModule.PROJECT_MEMBERS,
    'PROJECT_MEMBERS',
  )
  const projects = requireList(
    projectsModule.PROJECTS_DATA,
    'PROJECTS_DATA',
  ).map((project) => ({
    id: project.id,
    organizationId: project.organization_id,
    name: project.name,
    description: project.description,
    location: project.location,
    status: project.status,
    priority: project.priority,
    budget: project.budget,
    managerId: project.manager_id,
    isDraft: project.is_draft,
    progress: project.progress,
    startDate: project.start_date,
    dueDate: project.due_date,
    allocated: project.allocated,
    spent: project.spent,
    isOverBudget: project.is_over_budget,
    // `project_member.role` was dropped with the four-role migration (D-G):
    // membership is the link, the system role is what a person may do.
    members: (projectMembers[project.id] ?? []).map((m) => ({
      userId: m.user_id,
    })),
  }))

  // ── Tasks & subtasks ──────────────────────────────────────────────────
  const tasksSrc = read(`${SEED_DIR}/04_tasks_and_subtasks.py`)
  // `_task()` sets this one in its body rather than taking it as an argument.
  assertLiteral(tasksSrc, '"is_draft": False', '04_tasks_and_subtasks.py')
  const taskSignature = parseSignature(tasksSrc, '_task', { calls })
  const taskCalls = {
    ...calls,
    _task: (args, kwargs) => {
      const bound = bindArguments(taskSignature, args, kwargs)
      return {
        id: bound.task_id,
        projectId: bound.project_id,
        parentId: bound.parent_id,
        title: bound.title,
        status: bound.status,
        priority: bound.priority,
        progress: bound.progress,
        budget: bound.budget,
        startDate: bound.start_date,
        dueDate: bound.due_date,
        assigneeId: bound.assignee_id,
        delayReason: bound.delay_reason,
        delayDays: bound.delay_days,
        isBlocked: bound.is_blocked,
        isCriticalPath: bound.is_critical_path,
        isDraft: false,
        location: bound.location,
        spent: bound.spent,
      }
    },
  }
  const tasksModule = evaluateModuleAssignments(tasksSrc, {
    symbols,
    calls: taskCalls,
  }).assigned
  const tasks = collectNumbered(tasksModule, /^P(\d)_TASKS$/)

  // ── Dependencies ──────────────────────────────────────────────────────
  const dependenciesSrc = read(`${SEED_DIR}/05_dependencies.py`)
  const dependencies = requireList(
    evaluateModuleAssignments(dependenciesSrc, { symbols, calls }).assigned
      .DEPENDENCIES_DATA,
    'DEPENDENCIES_DATA',
  ).map(([taskId, dependsOnId, dependencyType]) => ({
    taskId,
    dependsOnId,
    dependencyType,
  }))

  // ── Expenses ──────────────────────────────────────────────────────────
  const expensesSrc = read(`${SEED_DIR}/06_expenses.py`)
  const expenseSignature = parseSignature(expensesSrc, '_expense', { calls })
  const expensesModule = evaluateModuleAssignments(expensesSrc, {
    symbols,
    calls: {
      ...calls,
      _expense: (args, kwargs) => {
        const bound = bindArguments(expenseSignature, args, kwargs)
        return {
          id: bound.expense_id,
          subtaskId: bound.subtask_id,
          description: bound.description,
          amount: bound.amount,
          category: bound.category,
          expenseDate: bound.expense_date,
          createdBy: bound.created_by,
        }
      },
    },
  }).assigned
  const expenses = collectNumbered(expensesModule, /^P(\d)_EXPENSES$/)

  // ── Subtask notes ─────────────────────────────────────────────────────
  const notesSrc = read(`${SEED_DIR}/08_subtask_notes.py`)
  const noteSignature = parseSignature(notesSrc, '_note', { calls })
  const subtaskNotes = requireList(
    evaluateModuleAssignments(notesSrc, {
      symbols,
      calls: {
        ...calls,
        _note: (args, kwargs) => {
          const bound = bindArguments(noteSignature, args, kwargs)
          return {
            id: bound.note_id,
            subtaskId: bound.subtask_id,
            authorId: bound.author_id,
            content: bound.content,
          }
        },
      },
    }).assigned.ALL_NOTES,
    'ALL_NOTES',
  )

  // ── Broken-dependency demo (D5/D18) ───────────────────────────────────
  const brokenSrc = read(`${SEED_DIR}/11_broken_dependency.py`)
  const brokenScope = evaluateModuleAssignments(brokenSrc, {
    symbols,
    calls,
    includeIndented: true,
  }).scope
  const brokenTasks = parseCallSites(brokenSrc, 'Task', {
    symbols: brokenScope,
    calls,
  }).map(({ kwargs }) => demoTask(kwargs))
  const brokenEdge = parseCallSites(brokenSrc, 'TaskDependency', {
    symbols: brokenScope,
    calls,
  })[0]
  const brokenDependency = {
    upstream: findById(brokenTasks, ids.P1_TASK_BROKEN_UPSTREAM),
    dependent: findById(brokenTasks, ids.P1_TASK_BROKEN_DEPENDENT),
    dependencyType: brokenEdge.kwargs.dependency_type,
  }

  // ── Force-start demo (D4/D24) ─────────────────────────────────────────
  const forceSrc = read(`${SEED_DIR}/13_force_start.py`)
  // ForceStartState is an alias of the shared ApprovalState since bk's
  // approval-machinery consolidation; the values live on the shared enum.
  const forceStates = Object.fromEntries(
    Object.entries(
      parseStrEnum(read('app/shared/approvals.py'), 'ApprovalState'),
    ).map(([name, value]) => [
      name.replace('ApprovalState', 'ForceStartState'),
      value,
    ]),
  )
  const forceScope = evaluateModuleAssignments(forceSrc, {
    symbols: { ...symbols, ...forceStates },
    calls,
    includeIndented: true,
  }).scope
  const forceTasks = parseCallSites(forceSrc, 'Task', {
    symbols: forceScope,
    calls,
  }).map(({ kwargs }) => demoTask(kwargs))
  const forceRequest = parseCallSites(forceSrc, 'ForceStartRequest', {
    symbols: forceScope,
    calls,
  })[0].kwargs
  const forceStart = {
    upstream: findById(forceTasks, ids.P1_TASK_FORCE_UPSTREAM),
    forced: findById(forceTasks, ids.P1_TASK_FORCE_STARTED),
    request: {
      id: forceRequest.id,
      taskId: forceRequest.task_id,
      reason: forceRequest.reason,
      state: forceRequest.state,
      requestorId: forceRequest.requestor_id,
      decidedBy: forceRequest.decided_by,
      decidedAt: forceRequest.decided_at,
      decisionComment: forceRequest.decision_comment,
    },
  }

  // ── Contract-derived import draft + its job (S7 · 6.3/6.4) ────────────
  const importSrc = read(`${SEED_DIR}/15_schedule_import.py`)
  // `_row()` writes these in its body rather than taking them as arguments.
  for (const literal of [
    '"date_source": "column"',
    '"is_milestone": False',
    '"is_loe": False',
    '"calendar_ref": None',
    '"content_hash": f"seed-{ref}"',
    '"task_id": None',
  ])
    assertLiteral(importSrc, literal, '15_schedule_import.py')

  // Pass 1 reads the module constants `_row()` closes over; pass 2 can then
  // evaluate the contract literal itself.
  const importConstants = evaluateModuleAssignments(importSrc, {
    symbols,
    calls,
  }).assigned
  const sheet = requireValue(importConstants.SHEET, 'SHEET')
  const sourceFilename = requireValue(
    importConstants.SOURCE_FILENAME,
    'SOURCE_FILENAME',
  )
  const rowSignature = parseSignature(importSrc, '_row', { calls })
  const importModule = evaluateModuleAssignments(importSrc, {
    symbols,
    calls: {
      ...calls,
      _row: (args, kwargs) =>
        contractRow(bindArguments(rowSignature, args, kwargs), sheet),
    },
  }).assigned
  const contract = requireValue(
    importModule.SCHEDULE_CONTRACT,
    'SCHEDULE_CONTRACT',
  )
  requireList(contract.rows, 'SCHEDULE_CONTRACT.rows')

  // The rows the seed writes are keyed by contract ref; the ids are stable so
  // the demo survives a reseed (D30).
  const taskIdByRef = requireValue(
    importModule._TASK_ID_BY_REF,
    '_TASK_ID_BY_REF',
  )
  for (const [ref, taskId] of Object.entries(taskIdByRef)) {
    if (!contract.rows.some((row) => row.ref === ref))
      throw new Error(`seed drift: _TASK_ID_BY_REF ref '${ref}' has no row`)
    if (typeof taskId !== 'string')
      throw new Error(`seed drift: _TASK_ID_BY_REF['${ref}'] is not an id`)
  }

  // Both rows are written with runtime expressions (`project.id`,
  // `contract.outcome.value`), so the values are taken from the contract and
  // the canonical ids, and the wiring itself is guarded literally.
  for (const literal of [
    'id=uuid.UUID(SCHEDULE_IMPORT_DRAFT_ID)',
    'contract_version=contract.contract_version',
    'outcome=contract.outcome.value',
    'contract=SCHEDULE_CONTRACT',
    'id=uuid.UUID(IMPORT_JOB_DRAFT_ID)',
    'schedule_import_id=uuid.UUID(SCHEDULE_IMPORT_DRAFT_ID)',
    'status=ImportJobStatus.DRAFT_READY.value',
  ])
    assertLiteral(importSrc, literal, '15_schedule_import.py')

  const scheduleImport = {
    id: ids.SCHEDULE_IMPORT_DRAFT_ID,
    projectId: ids.PROJECT_DRAFT_ID,
    organizationId: ids.ORG_LENNIX_ID,
    sourceFilename,
    sourceObject: `imports/${ids.ORG_LENNIX_ID}/${ids.PROJECT_DRAFT_ID}/${sourceFilename}`,
    sheet,
    contractVersion: contract.contract_version,
    outcome: contract.outcome,
    contract,
    taskIdByRef,
  }
  const importJob = {
    id: ids.IMPORT_JOB_DRAFT_ID,
    projectId: ids.PROJECT_DRAFT_ID,
    organizationId: ids.ORG_LENNIX_ID,
    scheduleImportId: ids.SCHEDULE_IMPORT_DRAFT_ID,
    sourceFilename,
    status: 'draft_ready',
  }

  return {
    digest: digestSources(msBkRoot),
    ids,
    roles,
    plans,
    enterpriseTerms,
    users,
    organization,
    projects,
    tasks,
    dependencies,
    expenses,
    subtaskNotes,
    brokenDependency,
    forceStart,
    scheduleImport,
    importJob,
  }
}

/** Mirrors the row `_row()` builds in `15_schedule_import.py` (S7 contract). */
function contractRow(bound, sheet) {
  return {
    ref: bound.ref,
    name: bound.name,
    level: bound.level,
    is_summary: bound.is_summary,
    hierarchy_signal: bound.signal,
    parent_ref: bound.parent_ref,
    start: bound.start,
    finish: bound.finish,
    duration_days: bound.duration,
    date_source: 'column',
    resources: bound.resources,
    quantity: bound.quantity,
    unit: bound.unit,
    percent_complete: bound.percent_complete,
    is_milestone: false,
    is_loe: false,
    calendar_ref: null,
    source: {
      sheet,
      row: bound.row,
      content_hash: `seed-${bound.ref}`,
      task_id: null,
    },
  }
}

function demoTask(kwargs) {
  return {
    id: kwargs.id,
    projectId: kwargs.project_id,
    parentId: kwargs.parent_id ?? null,
    title: kwargs.title,
    status: kwargs.status,
    priority: kwargs.priority,
    progress: kwargs.progress,
    budget: kwargs.budget ?? null,
    startDate: kwargs.start_date ?? null,
    dueDate: kwargs.due_date ?? null,
    isBlocked: kwargs.is_blocked ?? false,
    forceStarted: kwargs.force_started ?? false,
    atRisk: kwargs.at_risk ?? false,
    forceStartedBy: kwargs.force_started_by ?? null,
    deletedAt: kwargs.deleted_at ?? null,
  }
}

function findById(items, id) {
  const found = items.find((item) => item.id === id)
  if (!found) throw new Error(`seed drift: no demo entity with id ${id}`)
  return found
}

/** Concatenates `P1_X`…`P6_X` module lists in project order. */
function collectNumbered(module, pattern) {
  const buckets = Object.entries(module)
    .map(([name, value]) => [name.match(pattern), value])
    .filter(([match]) => match)
    .sort((a, b) => Number(a[0][1]) - Number(b[0][1]))
  if (buckets.length === 0)
    throw new Error(`seed drift: no module list matched ${pattern}`)
  return buckets.flatMap(([, value]) => value)
}

function requireValue(value, name) {
  if (value === undefined)
    throw new Error(`seed drift: could not read '${name}' from the seed`)
  return value
}

function requireList(value, name) {
  const list = requireValue(value, name)
  if (!Array.isArray(list) || list.length === 0)
    throw new Error(`seed drift: '${name}' is empty or not a list`)
  return list
}

/** A stable content hash of every backend file the manifest is derived from. */
export function digestSources(msBkRoot) {
  const hash = createHash('sha256')
  for (const file of SEED_SOURCE_FILES) {
    hash.update(file)
    hash.update(readSource(msBkRoot, file))
  }
  return hash.digest('hex').slice(0, 16)
}

// Re-exported so the Vitest drift check and the CLI share one implementation.
export { PythonExprParser }
