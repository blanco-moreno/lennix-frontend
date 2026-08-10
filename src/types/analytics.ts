import type { Project, ProjectHealth } from './project'

export interface ImpactChainNode {
  taskId: string
  title: string
  status: string
  priority: string
  progress: number
  startDate: string | null
  dueDate: string | null
  delayDays: number
  delayReason: string | null
  isBlocked: boolean
}

export interface CriticalPathItem {
  id: string
  projectId: string
  code: string
  originTaskId: string
  delayDays: number
  delayCategory: string | null
  affectedCount: number
  impactChain: ImpactChainNode[]
  isActive: boolean
  createdAt: string
}

export interface CriticalPathSummary {
  totalCriticalPaths: number
  activeCriticalPaths: number
  criticalPaths: CriticalPathItem[]
}

export interface ProjectDashboard {
  projectId: string
  projectName: string
  status: string
  priority: string
  overallProgress: number
  tasksTotal: number
  tasksCompleted: number
  tasksInProgress: number
  tasksBlocked: number
  budget: number | null
  allocated: number
  spent: number
  remaining: number
  isOverBudget: boolean
  teamSize: number
  startDate: string | null
  dueDate: string | null
  criticalPathsCount: number
  problemsCount: number
  /** The same verdict the list and the detail serve — the third surface. */
  health: ProjectHealth
  /** Hero KPIs: activities delayed or blocked, and the worst slip on the
   * project's critical path. */
  delayedOrBlockedTasks: number
  criticalPathSlipDays: number
}

export interface DelayedItem {
  taskId: string
  title: string
  delayDays: number
  delayReason: string | null
  priority: string
  isSubtask: boolean
  parentTitle: string | null
}

export interface DelayAnalysis {
  totalDelayed: number
  delayByReason: Record<string, number>
  mostDelayed: DelayedItem[]
  averageDelayDays: number
}

export interface TaskCompletionStats {
  periodStart: string
  periodEnd: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  averageProgress: number
}

/**
 * The organization home's rollup. Deliberately excludes generic project/task
 * counters — only what the home renders.
 *
 * Hero KPIs — the schedule-intelligence signals the ONE KPI system
 * renders. `oldestDraftAgeDays` is null when nothing waits to be activated.
 */
export interface OrganizationDashboard {
  delayedProjects: number
  /** Activities delayed or blocked — not `Task.atRisk`, which means
   * *force-started*. */
  delayedOrBlockedTasks: number
  criticalPathSlipDays: number
  oldestDraftAgeDays: number | null
  /**
   * The portfolio-health rows, worst first and capped by the server.
   * `delayedProjects` counts them; this names them.
   */
  projectsNeedingAttention: AttentionProject[]
}

/**
 * One portfolio-health row — a full project, plus what only the home shows.
 *
 * It **is** a `Project`, deliberately: a reduced shape with its own `reason`
 * field is how the home and the listing came to disagree about the same obra.
 * `health` says the verdict once, for every surface.
 */
export interface AttentionProject extends Project {
  delayedOrBlockedTasks: number
  criticalPathSlipDays: number
}
