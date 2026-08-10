import type { ProjectHealthDTO, ProjectResponseDTO } from './project-dto'

/** Node in a critical path impact chain */
export interface ImpactChainNodeDTO {
  task_id: string
  title: string
  status: string
  priority: string
  progress: number
  start_date: string | null
  due_date: string | null
  delay_days: number
  delay_reason: string | null
  is_blocked: boolean
}

/** Single critical path */
export interface CriticalPathResponseDTO {
  id: string
  project_id: string
  code: string
  origin_task_id: string
  delay_days: number
  delay_category: string | null
  affected_count: number
  impact_chain: ImpactChainNodeDTO[]
  is_active: boolean
  created_at: string
}

/** GET /v1/analytics/projects/:project_id/critical-paths — response */
export interface CriticalPathSummaryResponseDTO {
  total_critical_paths: number
  active_critical_paths: number
  critical_paths: CriticalPathResponseDTO[]
}

/** GET /v1/analytics/projects/:project_id/dashboard — response */
export interface ProjectDashboardResponseDTO {
  project_id: string
  project_name: string
  status: string
  priority: string
  overall_progress: number
  tasks_total: number
  tasks_completed: number
  tasks_in_progress: number
  tasks_blocked: number
  budget: string | null
  allocated: string
  spent: string
  remaining: string
  is_over_budget: boolean
  team_size: number
  start_date: string | null
  due_date: string | null
  critical_paths_count: number
  problems_count: number
  /** The same verdict the list and the detail serve — the third surface. */
  health: ProjectHealthDTO
  delayed_or_blocked_tasks: number
  critical_path_slip_days: number
}

/** Individual delayed item */
export interface DelayedItemResponseDTO {
  task_id: string
  title: string
  delay_days: number
  delay_reason: string | null
  priority: string
  is_subtask: boolean
  parent_title: string | null
}

/** GET /v1/analytics/projects/:project_id/delay-analysis — response */
export interface DelayAnalysisResponseDTO {
  total_delayed: number
  delay_by_reason: Record<string, number>
  most_delayed: DelayedItemResponseDTO[]
  average_delay_days: number
}

/** GET /v1/analytics/projects/:project_id/completion-stats — response */
export interface TaskCompletionStatsResponseDTO {
  period_start: string
  period_end: string
  total_tasks: number
  completed_tasks: number
  completion_rate: number
  average_progress: number
}

/** GET /v1/analytics/organizations/:organization_id/dashboard — response */
export interface OrganizationDashboardResponseDTO {
  delayed_projects: number
  /** Not `at_risk`: that flag means *force-started*, which is not what this
   * counts. */
  delayed_or_blocked_tasks: number
  critical_path_slip_days: number
  oldest_draft_age_days: number | null
  projects_needing_attention: AttentionProjectResponseDTO[]
}

/**
 * One row of the home's attention list — a **full project**, plus the two
 * counters only the home shows.
 *
 * It extends the list's own response on purpose: a reduced shape with a
 * `reason` field of its own is how the home and the listing came to paint the
 * same obra differently. `health` says it once, with no alias.
 */
export interface AttentionProjectResponseDTO extends ProjectResponseDTO {
  delayed_or_blocked_tasks: number
  critical_path_slip_days: number
}
