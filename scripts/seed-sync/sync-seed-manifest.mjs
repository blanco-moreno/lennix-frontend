#!/usr/bin/env node
/**
 * Regenerates `src/tests/seed/lennix-pro-seed.generated.ts` from the backend
 * `lennix_pro` seed.
 *
 *   pnpm seed:sync          # rewrite the manifest
 *   pnpm seed:sync --check  # fail if the checked-in manifest is stale
 *
 * The backend checkout is located via `LENNIX_MS_BK_PATH`, falling back to the
 * `../lennix-ms-bk` sibling. On a frontend-only checkout there is nothing to
 * compare against: `--check` reports that and exits 0 (the always-on fixture
 * assertions in `seed-sync.test.ts` still run).
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { extractSeedFacts, resolveMsBkRoot } from './extract-seed-facts.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FRONTEND_ROOT = path.resolve(HERE, '../..')
export const MANIFEST_PATH = path.join(
  FRONTEND_ROOT,
  'src/tests/seed/lennix-pro-seed.generated.ts',
)

const TYPES = `export interface SeedRole {
  id: number
  name: string
  slug: string
  description: string
}

export interface SeedPlan {
  id: number
  name: string
  maxTeamSize: number | null
  maxProjects: number | null
  maxDraftProjects: number | null
  storageMb: number
  aiRequests: number
}

export interface SeedPlanOverrides {
  organizationId: string
  maxTeamSize: number | null
  maxProjects: number | null
  maxDraftProjects: number | null
  storageMb: number | null
  aiRequests: number | null
  contractStart: string | null
  notes: string | null
}

export interface SeedUser {
  userId: string
  email: string
  firstName: string
  lastName: string
  roleId: number
}

/**
 * An organization membership — the tenancy link and nothing more. No role:
 * what a person may do is their system role (SeedUser.roleId).
 */
export interface SeedOrgMember {
  userId: string
}

/** A project membership. Its role reads "member" on every row. */
export interface SeedMember {
  userId: string
}

export interface SeedOrganization {
  id: string
  name: string
  slug: string
  planId: number
  ownerId: string
  members: readonly SeedOrgMember[]
}

export interface SeedProject {
  id: string
  organizationId: string
  name: string
  description: string | null
  location: string | null
  status: string
  priority: string
  budget: string | null
  managerId: string | null
  isDraft: boolean
  progress: number
  startDate: string | null
  dueDate: string | null
  allocated: string
  spent: string
  isOverBudget: boolean
  members: readonly SeedMember[]
}

export interface SeedTask {
  id: string
  projectId: string
  parentId: string | null
  title: string
  status: string
  priority: string
  progress: number
  budget: string | null
  startDate: string | null
  dueDate: string | null
  assigneeId: string | null
  delayReason: string | null
  delayDays: number
  isBlocked: boolean
  isCriticalPath: boolean
  isDraft: boolean
  location: string | null
  spent: string
}

/** A task the seed builds inline for a demo scenario (broken dep / force start). */
export interface SeedDemoTask {
  id: string
  projectId: string
  parentId: string | null
  title: string
  status: string
  priority: string
  progress: number
  budget: string | null
  startDate: string | null
  dueDate: string | null
  isBlocked: boolean
  forceStarted: boolean
  atRisk: boolean
  forceStartedBy: string | null
  deletedAt: string | null
}

export interface SeedDependency {
  taskId: string
  dependsOnId: string
  dependencyType: string
}

export interface SeedExpense {
  id: string
  subtaskId: string
  description: string
  amount: string
  category: string
  expenseDate: string
  createdBy: string
}

export interface SeedSubtaskNote {
  id: string
  subtaskId: string
  authorId: string
  content: string
}

export interface SeedBrokenDependency {
  upstream: SeedDemoTask
  dependent: SeedDemoTask
  dependencyType: string
}

export interface SeedForceStartRequest {
  id: string
  taskId: string
  reason: string
  state: string
  requestorId: string
  decidedBy: string
  decidedAt: string
  decisionComment: string
}

export interface SeedForceStart {
  upstream: SeedDemoTask
  forced: SeedDemoTask
  request: SeedForceStartRequest
}

/** One row of the S7 schedule contract, as ms-ai emits it. */
export interface SeedContractRow {
  ref: string
  name: string
  level: number
  is_summary: boolean
  hierarchy_signal: string
  parent_ref: string | null
  start: string | null
  finish: string | null
  duration_days: number | null
  date_source: string
  resources: string | null
  quantity: string | null
  unit: string | null
  percent_complete: number | null
  is_milestone: boolean
  is_loe: boolean
  calendar_ref: string | null
  source: {
    sheet: string
    row: number
    content_hash: string
    task_id: string | null
  }
}

/**
 * The contract verbatim. Typed by what the redesign reads and left open for the
 * rest: bk stores and serves ms-ai's payload unchanged (S7 passthrough), so the
 * frontend must tolerate additive fields it does not know yet.
 */
export interface SeedScheduleContract {
  contract_version: string
  source_filename: string
  sheet: string
  outcome: string
  rows: readonly SeedContractRow[]
  edges: readonly Record<string, unknown>[]
  report: Record<string, unknown>
  ledger: readonly Record<string, unknown>[]
  quality: Record<string, unknown>
  metrics: Record<string, unknown>
  [key: string]: unknown
}

/** The landed import: contract + the ids the seed gave each contract row. */
export interface SeedScheduleImport {
  id: string
  projectId: string
  organizationId: string
  sourceFilename: string
  sourceObject: string
  sheet: string
  contractVersion: string
  outcome: string
  contract: SeedScheduleContract
  taskIdByRef: Readonly<Record<string, string>>
}

/** The upload that produced it, in its terminal state (6.4). */
export interface SeedImportJob {
  id: string
  projectId: string
  organizationId: string
  scheduleImportId: string
  sourceFilename: string
  status: string
}`

const literal = (value) => JSON.stringify(value, null, 2)

export function renderManifest(facts) {
  return `/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Mirror of the backend \`lennix_pro\` demo seed
 * (\`lennix-ms-bk/app/seeds/lennix_pro/*\`), the dataset a seeded Lennix really
 * serves. Regenerate with \`pnpm seed:sync\`; \`seed-sync.test.ts\` fails when
 * this file drifts from the seed.
 *
 * Frontend fixtures and MSW handlers must read their data from here (never
 * hand-written demo values), so unit tests exercise the real demo data.
 */

/** Content hash of every backend seed file this manifest was derived from. */
export const SEED_SOURCE_DIGEST = ${literal(facts.digest)}

/** Stable IDs, mirroring \`app/seeds/lennix_pro/constants.py\`. */
export const SEED_IDS = ${literal(facts.ids)} as const

export type SeedIdName = keyof typeof SEED_IDS

${TYPES}

export const SEED_ROLES: readonly SeedRole[] = ${literal(facts.roles)}

export const SEED_PLANS: readonly SeedPlan[] = ${literal(facts.plans)}

export const SEED_PLAN_OVERRIDES: SeedPlanOverrides = ${literal(facts.planOverrides)}

export const SEED_USERS: readonly SeedUser[] = ${literal(facts.users)}

export const SEED_ORGANIZATION: SeedOrganization = ${literal(facts.organization)}

export const SEED_PROJECTS: readonly SeedProject[] = ${literal(facts.projects)}

export const SEED_TASKS: readonly SeedTask[] = ${literal(facts.tasks)}

export const SEED_DEPENDENCIES: readonly SeedDependency[] = ${literal(facts.dependencies)}

export const SEED_EXPENSES: readonly SeedExpense[] = ${literal(facts.expenses)}

export const SEED_SUBTASK_NOTES: readonly SeedSubtaskNote[] = ${literal(facts.subtaskNotes)}

export const SEED_BROKEN_DEPENDENCY: SeedBrokenDependency = ${literal(facts.brokenDependency)}

export const SEED_FORCE_START: SeedForceStart = ${literal(facts.forceStart)}

export const SEED_SCHEDULE_IMPORT: SeedScheduleImport = ${literal(facts.scheduleImport)}

export const SEED_IMPORT_JOB: SeedImportJob = ${literal(facts.importJob)}
`
}

/** Runs the repo's prettier so the generated file satisfies `pnpm lint`. */
function format(source) {
  const binary = path.join(FRONTEND_ROOT, 'node_modules/.bin/prettier')
  if (!existsSync(binary)) return source
  return execFileSync(binary, ['--parser', 'typescript'], {
    input: source,
    encoding: 'utf8',
    cwd: FRONTEND_ROOT,
  })
}

export function buildManifest(msBkRoot) {
  return format(renderManifest(extractSeedFacts(msBkRoot)))
}

function main() {
  const check = process.argv.includes('--check')
  const msBkRoot = resolveMsBkRoot()

  if (!msBkRoot) {
    const message =
      'lennix-ms-bk not found (set LENNIX_MS_BK_PATH) — seed manifest not verified.'
    if (check) {
      console.warn(`seed:sync --check skipped: ${message}`)
      return
    }
    console.error(`seed:sync failed: ${message}`)
    process.exit(1)
  }

  const next = buildManifest(msBkRoot)
  const current = existsSync(MANIFEST_PATH)
    ? readFileSync(MANIFEST_PATH, 'utf8')
    : null

  if (check) {
    if (current === next) {
      console.log('seed manifest is in sync with the lennix_pro seed.')
      return
    }
    console.error(
      'seed manifest is STALE: the lennix_pro seed changed.\n' +
        'Run `pnpm seed:sync`, then update the fixtures the change affects.',
    )
    process.exit(1)
  }

  writeFileSync(MANIFEST_PATH, next)
  console.log(`wrote ${path.relative(FRONTEND_ROOT, MANIFEST_PATH)}`)
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) main()
