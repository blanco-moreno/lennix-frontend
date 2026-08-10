/**
 * Lookups over the generated `lennix_pro` seed manifest.
 *
 * Every fixture in this folder resolves its values through these helpers, so a
 * seed change surfaces as a failing lookup instead of a stale literal.
 */

import {
  SEED_BROKEN_DEPENDENCY,
  SEED_FORCE_START,
  SEED_PROJECTS,
  SEED_TASKS,
  SEED_USERS,
  type SeedDemoTask,
  type SeedProject,
  type SeedTask,
  type SeedUser,
} from '@/tests/seed'

/**
 * The seed lets Postgres stamp `created_at`, so there is no seeded value to
 * mirror. Fixtures use this fixed instant instead — deterministic, and clearly
 * a fixture concern rather than a seed fact.
 */
export const FIXTURE_CREATED_AT = '2026-07-24T12:00:00Z'

/** Normalises a seed `Decimal` (`"208000"`) to the API's 2-decimal string. */
export function decimal(value: string | null): string | null {
  return value === null ? null : Number(value).toFixed(2)
}

/** Same as `decimal()` for columns the API never returns as null. */
export function requiredDecimal(value: string | null): string {
  const result = decimal(value)
  if (result === null) throw new Error('expected a decimal, got null')
  return result
}

function orThrow<T>(value: T | undefined, what: string): T {
  if (value === undefined)
    throw new Error(
      `${what} is not in the lennix_pro seed manifest — run \`pnpm seed:sync\` ` +
        'and update the fixture that referenced it.',
    )
  return value
}

export function seedUser(userId: string): SeedUser {
  return orThrow(
    SEED_USERS.find((user) => user.userId === userId),
    `user ${userId}`,
  )
}

/** `"Carlos Rodriguez"` — how the API renders `manager_name` / `assignee_name`. */
export function seedUserName(userId: string | null): string | null {
  if (userId === null) return null
  const user = seedUser(userId)
  return `${user.firstName} ${user.lastName}`
}

export function seedProject(projectId: string): SeedProject {
  return orThrow(
    SEED_PROJECTS.find((project) => project.id === projectId),
    `project ${projectId}`,
  )
}

/** The six live projects — the draft is served only by the drafts endpoint. */
export function seedLiveProjects(): SeedProject[] {
  return SEED_PROJECTS.filter((project) => !project.isDraft)
}

export function seedDraftProjects(): SeedProject[] {
  return SEED_PROJECTS.filter((project) => project.isDraft)
}

export function seedTask(taskId: string): SeedTask {
  return orThrow(
    SEED_TASKS.find((task) => task.id === taskId),
    `task ${taskId}`,
  )
}

export function seedSubtasksOf(taskId: string): SeedTask[] {
  return SEED_TASKS.filter((task) => task.parentId === taskId)
}

/**
 * A demo task (broken-dependency / force-start scenario) reshaped like a seed
 * task, so the task fixtures can build one uniform tree. The seed creates these
 * with the model defaults for everything it doesn't set.
 */
function fromDemoTask(demo: SeedDemoTask): SeedTask {
  return {
    id: demo.id,
    projectId: demo.projectId,
    parentId: demo.parentId,
    title: demo.title,
    status: demo.status,
    priority: demo.priority,
    progress: demo.progress,
    budget: demo.budget,
    startDate: demo.startDate,
    dueDate: demo.dueDate,
    assigneeId: null,
    delayReason: null,
    delayDays: 0,
    isBlocked: demo.isBlocked,
    isCriticalPath: false,
    isDraft: false,
    location: null,
    spent: '0',
  }
}

/** The incomplete upstream the force-start override bypassed. */
export const FORCE_START_UPSTREAM_TASK: SeedTask = fromDemoTask(
  SEED_FORCE_START.upstream,
)

/** The dependent that was force-started through an approved request. */
export const FORCE_STARTED_TASK: SeedTask = fromDemoTask(
  SEED_FORCE_START.forced,
)

const FORCE_START_TASKS: readonly SeedTask[] = [
  FORCE_START_UPSTREAM_TASK,
  FORCE_STARTED_TASK,
]

/** The live dependent of the soft-deleted upstream. */
export const BROKEN_DEPENDENT_TASK: SeedTask = fromDemoTask(
  SEED_BROKEN_DEPENDENCY.dependent,
)

/**
 * The soft-deleted upstream. It is NOT part of any list response — the API
 * filters `deleted_at IS NOT NULL` — but the dependency it leaves behind is
 * what makes its dependent a broken dependency.
 */
export const BROKEN_UPSTREAM_TASK: SeedTask = fromDemoTask(
  SEED_BROKEN_DEPENDENCY.upstream,
)

/**
 * Force-start provenance per task id. Only the force-started dependent
 * carries it; `_task()` leaves both flags at the model default for every other
 * seeded task.
 */
const SEED_TASK_FLAGS: Readonly<
  Record<string, { forceStarted: boolean; atRisk: boolean }>
> = {
  [SEED_FORCE_START.forced.id]: {
    forceStarted: SEED_FORCE_START.forced.forceStarted,
    atRisk: SEED_FORCE_START.forced.atRisk,
  },
}

export function seedTaskFlags(taskId: string): {
  forceStarted: boolean
  atRisk: boolean
} {
  return SEED_TASK_FLAGS[taskId] ?? { forceStarted: false, atRisk: false }
}

/**
 * Every task the API serves for a project: the seeded phase tree plus the
 * demo-scenario tasks, minus the soft-deleted upstream.
 */
export function seedLiveTasksOf(projectId: string): SeedTask[] {
  const demo = [...FORCE_START_TASKS, BROKEN_DEPENDENT_TASK].filter(
    (task) => task.projectId === projectId,
  )
  return [...SEED_TASKS.filter((task) => task.projectId === projectId), ...demo]
}

/** Parent tasks only — what `GET /v1/tasks/projects/:id/tasks` returns. */
export function seedParentTasksOf(projectId: string): SeedTask[] {
  return seedLiveTasksOf(projectId).filter((task) => task.parentId === null)
}
