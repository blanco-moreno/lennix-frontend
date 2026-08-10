/** `/v1/tasks` responses (tasks, subtasks and dependency chains) for the seed. */

import {
  SEED_BROKEN_DEPENDENCY,
  SEED_DEPENDENCIES,
  SEED_FORCE_START,
  SEED_IDS,
  type SeedTask,
} from '@/tests/seed'
import type {
  DependencyChainResponseDTO,
  DependencyNodeDTO,
  DependencyNodeTaskDTO,
  TaskDependencyResponseDTO,
} from '@/types/dto/dependency-dto'
import type {
  AssignedSubtaskResponseDTO,
  SubtaskResponseDTO,
} from '@/types/dto/subtask-dto'
import type { TaskResponseDTO } from '@/types/dto/task-dto'

import { SEED_CURRENT_USER_ID } from './auth-fixtures'
import {
  BROKEN_DEPENDENT_TASK,
  BROKEN_UPSTREAM_TASK,
  FIXTURE_CREATED_AT,
  FORCE_STARTED_TASK,
  decimal,
  requiredDecimal,
  seedLiveTasksOf,
  seedParentTasksOf,
  seedProject,
  seedSubtasksOf,
  seedTask,
  seedTaskFlags,
  seedUserName,
} from './seed-lookup'

function toSubtaskDTO(task: SeedTask): SubtaskResponseDTO {
  const flags = seedTaskFlags(task.id)
  if (task.parentId === null)
    throw new Error(`task ${task.id} is not a subtask`)
  return {
    id: task.id,
    parent_id: task.parentId,
    title: task.title,
    description: null,
    status: task.status,
    priority: task.priority,
    progress: task.progress,
    start_date: task.startDate,
    due_date: task.dueDate,
    location: task.location,
    assignee_id: task.assigneeId,
    assignee_name: seedUserName(task.assigneeId),
    spent: requiredDecimal(task.spent),
    delay_reason: task.delayReason,
    delay_days: task.delayDays,
    is_blocked: task.isBlocked,
    is_critical_path: task.isCriticalPath,
    force_started: flags.forceStarted,
    at_risk: flags.atRisk,
    // The seed's one mirror subtask (the one the backend creates for a bare
    // task) is created at go-live by `enforce_mirror_invariant`, which stamps
    // a runtime id the manifest cannot mirror — so no fixture subtask carries
    // the flag. The import surfaces get it from the review state instead
    // (drafts carry none by design).
    system_generated: false,
    created_at: FIXTURE_CREATED_AT,
  }
}

function toTaskDTO(task: SeedTask): TaskResponseDTO {
  const flags = seedTaskFlags(task.id)
  return {
    id: task.id,
    project_id: task.projectId,
    project_name: seedProject(task.projectId).name,
    title: task.title,
    description: null,
    // The generated seed mirror types these as `string`; the values come from
    // the enum-validated backend seed, so the narrowing is safe.
    status: task.status as TaskResponseDTO['status'],
    priority: task.priority as TaskResponseDTO['priority'],
    budget: decimal(task.budget),
    progress: task.progress,
    start_date: task.startDate,
    due_date: task.dueDate,
    spent: requiredDecimal(task.spent),
    // `_task()` never sets it, so every seeded task keeps the column default.
    is_over_budget: false,
    delay_reason: task.delayReason,
    delay_days: task.delayDays,
    is_draft: task.isDraft,
    is_blocked: task.isBlocked,
    is_critical_path: task.isCriticalPath,
    assignee_id: task.assigneeId,
    assignee_name: seedUserName(task.assigneeId),
    force_started: flags.forceStarted,
    at_risk: flags.atRisk,
    created_at: FIXTURE_CREATED_AT,
    subtasks: seedSubtasksOf(task.id).map(toSubtaskDTO),
  }
}

export function seedTaskDTO(
  taskId: string,
  overrides?: Partial<TaskResponseDTO>,
): TaskResponseDTO {
  return { ...toTaskDTO(seedTask(taskId)), ...overrides }
}

/** The default subject for task-scoped handlers: P1's Cimentacion phase. */
export const DEFAULT_SEED_TASK_ID = SEED_IDS.P1_TASK_FOUNDATION
export const DEFAULT_SEED_SUBTASK_ID = SEED_IDS.P1_SUB_EXCAVATION

function resolveSeedId(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  try {
    seedTask(value)
    return value
  } catch {
    return fallback
  }
}

/** Maps a route param to a seeded parent-task id (falls back to the default). */
export function resolveSeedTaskId(value: unknown): string {
  return resolveSeedId(value, DEFAULT_SEED_TASK_ID)
}

/** Maps a route param to a seeded subtask id (falls back to the default). */
export function resolveSeedSubtaskId(value: unknown): string {
  const id = resolveSeedId(value, DEFAULT_SEED_SUBTASK_ID)
  return seedTask(id).parentId === null ? DEFAULT_SEED_SUBTASK_ID : id
}

export function seedSubtaskDTO(
  subtaskId: string,
  overrides?: Partial<SubtaskResponseDTO>,
): SubtaskResponseDTO {
  return { ...toSubtaskDTO(seedTask(subtaskId)), ...overrides }
}

/** `GET /v1/tasks/projects/:id/tasks` — parent tasks with nested subtasks. */
export function seedTaskListDTO(projectId: string): TaskResponseDTO[] {
  return seedParentTasksOf(projectId).map(toTaskDTO)
}

export function seedSubtaskListDTO(taskId: string): SubtaskResponseDTO[] {
  return seedSubtasksOf(taskId).map(toSubtaskDTO)
}

const SEED_LIVE_PROJECT_IDS = [
  SEED_IDS.PROJECT_TORRE_ID,
  SEED_IDS.PROJECT_CENTRO_ID,
  SEED_IDS.PROJECT_COMPLEJO_ID,
  SEED_IDS.PROJECT_OFICINAS_ID,
  SEED_IDS.PROJECT_HOSPITAL_ID,
  SEED_IDS.PROJECT_PARKING_ID,
]

/** Every parent task in the org, across all live projects (`GET /v1/tasks/`). */
export function seedOrganizationTaskListDTO(): TaskResponseDTO[] {
  return SEED_LIVE_PROJECT_IDS.flatMap(seedParentTasksOf).map(toTaskDTO)
}

/**
 * The demo login's queue for `GET /v1/tasks/assigned`. The endpoint takes no
 * assignee parameter — "assigned to me" is read from the token — so the caller
 * is resolved from `SEED_CURRENT_USER_ID`, as `authMeHandler` does.
 *
 * Both levels answer, as ms-bk's `get_assigned_activities` does: a subactivity
 * assigned to the caller, and a first-level activity assigned to them directly.
 * The seed carries exactly one of the latter (Entrega Final), so the queue's
 * null `parent_id`/`parent_title` row is real data, not a hand-made payload.
 */
export function seedAssignedSubtaskListDTO(): AssignedSubtaskResponseDTO[] {
  return SEED_LIVE_PROJECT_IDS.flatMap((projectId) =>
    seedLiveTasksOf(projectId)
      .filter((task) => task.assigneeId === SEED_CURRENT_USER_ID)
      .map((task) => ({
        // `toSubtaskDTO` refuses a first-level task, so the shared body is
        // built with a placeholder parent and the real one written after.
        ...toSubtaskDTO({ ...task, parentId: task.parentId ?? task.id }),
        parent_id: task.parentId,
        project_id: projectId,
        project_name: seedProject(projectId).name,
        parent_title: task.parentId ? seedTask(task.parentId).title : null,
      })),
  )
}

/**
 * The force-started task: work started under an approved override, so it is
 * unblocked but permanently `at_risk`.
 */
export function seedForceStartedTaskDTO(): TaskResponseDTO {
  return toTaskDTO(FORCE_STARTED_TASK)
}

/**
 * The live dependent of a soft-deleted, incomplete upstream: it stays blocked
 * because the dependency is broken, not satisfied.
 */
export function seedBrokenDependentTaskDTO(): TaskResponseDTO {
  return toTaskDTO(BROKEN_DEPENDENT_TASK)
}

/** The soft-deleted upstream — never returned by a list endpoint. */
export function seedBrokenUpstreamTaskDTO(): TaskResponseDTO {
  return toTaskDTO(BROKEN_UPSTREAM_TASK)
}

function toDependencyNodeTask(task: SeedTask): DependencyNodeTaskDTO {
  const flags = seedTaskFlags(task.id)
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    progress: task.progress,
    start_date: task.startDate,
    due_date: task.dueDate,
    delay_reason: task.delayReason,
    delay_days: task.delayDays,
    is_blocked: task.isBlocked,
    force_started: flags.forceStarted,
  }
}

/** The seeded edges of a project, plus the two demo-scenario edges. */
export function seedDependenciesOf(projectId: string): {
  taskId: string
  dependsOnId: string
  dependencyType: string
}[] {
  const tasks = new Map(
    [...seedLiveTasksOf(projectId), BROKEN_UPSTREAM_TASK].map((task) => [
      task.id,
      task,
    ]),
  )
  const demoEdges =
    projectId === SEED_BROKEN_DEPENDENCY.dependent.projectId
      ? [
          {
            taskId: SEED_BROKEN_DEPENDENCY.dependent.id,
            dependsOnId: SEED_BROKEN_DEPENDENCY.upstream.id,
            dependencyType: SEED_BROKEN_DEPENDENCY.dependencyType,
          },
          {
            taskId: SEED_FORCE_START.forced.id,
            dependsOnId: SEED_FORCE_START.upstream.id,
            dependencyType: 'inter_phase',
          },
        ]
      : []
  return [...SEED_DEPENDENCIES, ...demoEdges].filter(
    (edge) => tasks.has(edge.taskId) && tasks.has(edge.dependsOnId),
  )
}

/**
 * `GET /v1/tasks/projects/:id/dependencies`.
 *
 * Mirrors the backend grouping: `inter_phase` is a flat list, `intra_phase` is
 * keyed by the dependent's parent task id. An edge whose upstream is
 * soft-deleted (the broken-dependency demo) is **kept and flagged** `is_broken`
 * — that is the state the re-link affordance acts on; hiding it
 * left a blocked row with no visible cause.
 */
export function seedDependencyChainDTO(
  projectId: string,
): DependencyChainResponseDTO {
  const tasks = new Map(
    [...seedLiveTasksOf(projectId), BROKEN_UPSTREAM_TASK].map((task) => [
      task.id,
      task,
    ]),
  )
  const interPhase: DependencyNodeDTO[] = []
  const intraPhase: Record<string, DependencyNodeDTO[]> = {}

  seedDependenciesOf(projectId).forEach((edge, index) => {
    const task = tasks.get(edge.taskId)
    if (!task || task.id === BROKEN_UPSTREAM_TASK.id) return
    const dependsOn = tasks.get(edge.dependsOnId)
    const node: DependencyNodeDTO = {
      id: String(index + 1),
      task: toDependencyNodeTask(task),
      depends_on: dependsOn ? toDependencyNodeTask(dependsOn) : null,
      relationship_type: 'FS',
      lag_days: 0,
      // The soft-deleted upstream keeps its identity so the broken link stays nameable while re-linking.
      is_broken: !dependsOn || dependsOn.id === BROKEN_UPSTREAM_TASK.id,
    }
    if (edge.dependencyType === 'inter_phase') {
      interPhase.push(node)
      return
    }
    const key = task.parentId ?? task.id
    intraPhase[key] = [...(intraPhase[key] ?? []), node]
  })

  return { inter_phase: interPhase, intra_phase: intraPhase }
}

/** `POST /v1/tasks/:id/dependencies` — the created edge. */
export function seedTaskDependencyDTO(
  overrides?: Partial<TaskDependencyResponseDTO>,
): TaskDependencyResponseDTO {
  return {
    id: 1,
    task_id: SEED_IDS.P1_TASK_STRUCTURE,
    depends_on_id: SEED_IDS.P1_TASK_FOUNDATION,
    dependency_type: 'inter_phase',
    relationship_type: 'FS',
    lag_days: 0,
    created_at: FIXTURE_CREATED_AT,
    ...overrides,
  }
}
