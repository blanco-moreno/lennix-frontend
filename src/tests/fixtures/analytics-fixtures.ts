/**
 * `/v1/analytics` responses, computed from the seed with the same arithmetic
 * `app/analytics/services.py` applies, so KPI tests assert real numbers.
 *
 * One exception: the critical path is derived on read by the schedule engine
 * — there is no seeded table. The fixture reproduces the zero-float
 * chain of the seeded inter-phase dependencies; tests that need engine-specific
 * delay propagation should override the values they assert on.
 */

import { SEED_PROJECTS, SEED_IDS, type SeedTask } from '@/tests/seed'
import type {
  CriticalPathResponseDTO,
  CriticalPathSummaryResponseDTO,
  DelayAnalysisResponseDTO,
  DelayedItemResponseDTO,
  ImpactChainNodeDTO,
  OrganizationDashboardResponseDTO,
  ProjectDashboardResponseDTO,
  TaskCompletionStatsResponseDTO,
} from '@/types/dto/analytics-dto'

import { seedProjectDTO, seedProjectHealthDTO } from './project-fixtures'
import {
  FIXTURE_CREATED_AT,
  seedLiveTasksOf,
  seedParentTasksOf,
  seedProject,
  seedTask,
} from './seed-lookup'

const round = (value: number, digits = 2) => Number(value.toFixed(digits))

export function seedProjectDashboardDTO(
  projectId: string,
): ProjectDashboardResponseDTO {
  const project = seedProject(projectId)
  const parents = seedParentTasksOf(projectId)
  const all = seedLiveTasksOf(projectId)
  const budget = Number(project.budget ?? 0)
  const spent = Number(project.spent)
  const blocked = parents.filter((task) => task.isBlocked).length
  const delayed = all.filter((task) => task.delayDays > 0).length

  return {
    project_id: project.id,
    project_name: project.name,
    status: project.status,
    priority: project.priority,
    overall_progress: project.progress,
    tasks_total: parents.length,
    tasks_completed: parents.filter((task) => task.status === 'done').length,
    tasks_in_progress: parents.filter((task) => task.status === 'in_progress')
      .length,
    tasks_blocked: blocked,
    budget: project.budget === null ? null : budget.toFixed(2),
    allocated: Number(project.allocated).toFixed(2),
    spent: spent.toFixed(2),
    remaining: (budget ? budget - spent : 0).toFixed(2),
    is_over_budget: project.isOverBudget,
    team_size: project.members.length,
    start_date: project.startDate,
    due_date: project.dueDate,
    // 1 when the project has a critical path; the engine consolidates the
    // zero-float chain into a single path, so this is never > 1.
    critical_paths_count: seedCriticalPathChain(projectId).length > 0 ? 1 : 0,
    problems_count: delayed + blocked,
    health: seedProjectHealthDTO(project),
    delayed_or_blocked_tasks: countDelayedOrBlockedTasks(parents),
    critical_path_slip_days: worstCriticalPathSlip(all),
  }
}

/**
 * Hero KPI: activities — never subactivities — that are delayed or
 * blocked. Same arithmetic as `_count_delayed_or_blocked_tasks` in ms-bk.
 */
function countDelayedOrBlockedTasks(parents: SeedTask[]): number {
  return parents.filter((task) => task.delayDays > 0 || task.isBlocked).length
}

/**
 * Hero KPI: the worst slip on the critical path — a max, not a sum,
 * because propagated delay repeats down the chain. Mirrors
 * `_critical_path_slip_days` in ms-bk.
 */
function worstCriticalPathSlip(tasks: SeedTask[]): number {
  const slips = tasks
    .filter((task) => task.isCriticalPath && !task.isDraft)
    .map((task) => task.delayDays)
  return slips.length ? Math.max(...slips) : 0
}

/**
 * The portfolio-health rows, with the server's rule: the engine's
 * `delayed` verdict first, then a due date that has merely passed, each bucket
 * least-progress first, capped.
 *
 * `today` is a parameter because the rule reads a clock and the seed's due
 * dates are fixed — a test asserting *which* obras appear pins it, or it starts
 * asserting a different portfolio the day a due date passes.
 */
const ATTENTION_LIMIT = 5
const SETTLED_STATUSES = ['completed', 'archived']

function seedAttentionRows(
  today: Date,
): OrganizationDashboardResponseDTO['projects_needing_attention'] {
  const live = SEED_PROJECTS.filter((project) => !project.isDraft)

  const rank = (project: (typeof SEED_PROJECTS)[number]) => {
    if (project.status === 'delayed') return 0
    const overdue =
      !SETTLED_STATUSES.includes(project.status) &&
      project.dueDate !== null &&
      new Date(project.dueDate).getTime() < today.getTime()
    return overdue ? 1 : -1
  }

  return (
    live
      .map((project) => ({ project, bucket: rank(project) }))
      .filter((row) => row.bucket >= 0)
      .sort(
        (a, b) =>
          a.bucket - b.bucket || a.project.progress - b.project.progress,
      )
      .slice(0, ATTENTION_LIMIT)
      // The row IS a full project response. No `reason` field: `health` says
      // it once, in the vocabulary every other surface reads. The bucket
      // survives only as the ORDER — ranking is the home's business.
      .map(({ project }) => ({
        ...seedProjectDTO(project.id),
        delayed_or_blocked_tasks: countDelayedOrBlockedTasks(
          seedParentTasksOf(project.id),
        ),
        critical_path_slip_days: worstCriticalPathSlip(
          seedLiveTasksOf(project.id),
        ),
      }))
  )
}

export function seedOrganizationDashboardDTO(
  today: Date = new Date(),
): OrganizationDashboardResponseDTO {
  const projects = SEED_PROJECTS
  const livePortfolio = projects.filter((project) => !project.isDraft)

  return {
    // Hero KPIs. Drafts are excluded from every portfolio signal — a
    // draft is not part of the schedule the org is running.
    delayed_projects: livePortfolio.filter(
      (project) => project.status === 'delayed',
    ).length,
    delayed_or_blocked_tasks: livePortfolio
      .map((project) =>
        countDelayedOrBlockedTasks(seedParentTasksOf(project.id)),
      )
      .reduce((sum, count) => sum + count, 0),
    critical_path_slip_days: Math.max(
      0,
      ...livePortfolio.map((project) =>
        worstCriticalPathSlip(seedLiveTasksOf(project.id)),
      ),
    ),
    // The seed lets Postgres stamp `created_at`, so its drafts were created
    // "now" — they have been waiting less than a day.
    oldest_draft_age_days: projects.some((project) => project.isDraft)
      ? 0
      : null,
    // The rollup names them as well as counting them — the home reads this
    // instead of fetching every project and a dashboard per slipping row.
    projects_needing_attention: seedAttentionRows(today),
  }
}

export function seedDelayAnalysisDTO(
  projectId: string,
): DelayAnalysisResponseDTO {
  const delayed = seedLiveTasksOf(projectId)
    .filter((task) => task.delayDays > 0)
    .sort((a, b) => b.delayDays - a.delayDays)

  if (delayed.length === 0)
    return {
      total_delayed: 0,
      delay_by_reason: {},
      most_delayed: [],
      average_delay_days: 0,
    }

  const byReason: Record<string, number> = {}
  for (const task of delayed) {
    const reason = task.delayReason ?? 'unspecified'
    byReason[reason] = (byReason[reason] ?? 0) + 1
  }

  const mostDelayed: DelayedItemResponseDTO[] = delayed
    .slice(0, 10)
    .map((task) => ({
      task_id: task.id,
      title: task.title,
      delay_days: task.delayDays,
      delay_reason: task.delayReason,
      priority: task.priority,
      is_subtask: task.parentId !== null,
      parent_title: task.parentId ? seedTask(task.parentId).title : null,
    }))

  return {
    total_delayed: delayed.length,
    delay_by_reason: byReason,
    most_delayed: mostDelayed,
    average_delay_days: round(
      delayed.reduce((sum, task) => sum + task.delayDays, 0) / delayed.length,
      1,
    ),
  }
}

export function seedTaskCompletionStatsDTO(
  projectId: string,
): TaskCompletionStatsResponseDTO {
  const parents = seedParentTasksOf(projectId).filter((task) => !task.isDraft)
  const completed = parents.filter((task) => task.status === 'done').length
  const averageProgress = parents.length
    ? parents.reduce((sum, task) => sum + task.progress, 0) / parents.length
    : 0
  return {
    // The backend uses a rolling 30-day window ending today; fixtures pin it.
    period_start: '2026-06-24',
    period_end: '2026-07-24',
    total_tasks: parents.length,
    completed_tasks: completed,
    completion_rate: parents.length
      ? round((completed / parents.length) * 100)
      : 0,
    average_progress: round(averageProgress),
  }
}

/**
 * The seeded inter-phase chain of a project, in order — the zero-float path the
 * engine derives for the linear seed graphs.
 */
function seedCriticalPathChain(projectId: string): SeedTask[] {
  const parents = seedParentTasksOf(projectId).filter(
    (task) => task.id !== SEED_IDS.P1_TASK_BROKEN_DEPENDENT,
  )
  return parents.filter((task) => !task.isDraft)
}

export function seedCriticalPathSummaryDTO(
  projectId: string,
  overrides?: Partial<CriticalPathSummaryResponseDTO>,
): CriticalPathSummaryResponseDTO {
  const chain = seedCriticalPathChain(projectId)
  if (chain.length === 0)
    return {
      total_critical_paths: 0,
      active_critical_paths: 0,
      critical_paths: [],
      ...overrides,
    }

  const impactChain: ImpactChainNodeDTO[] = chain.map((task) => ({
    task_id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    progress: task.progress,
    start_date: task.startDate,
    due_date: task.dueDate,
    delay_days: task.delayDays,
    delay_reason: task.delayReason,
    is_blocked: task.isBlocked,
  }))

  const origin = chain[0]
  const path: CriticalPathResponseDTO = {
    id: origin.id,
    project_id: projectId,
    code: 'RT-1',
    origin_task_id: origin.id,
    delay_days: origin.delayDays,
    delay_category: origin.delayReason,
    affected_count: chain.length - 1,
    impact_chain: impactChain,
    is_active: true,
    created_at: FIXTURE_CREATED_AT,
  }

  return {
    total_critical_paths: 1,
    active_critical_paths: 1,
    critical_paths: [path],
    ...overrides,
  }
}
