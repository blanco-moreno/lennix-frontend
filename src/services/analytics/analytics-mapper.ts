import type {
  AttentionProject,
  CriticalPathItem,
  CriticalPathSummary,
  DelayAnalysis,
  DelayedItem,
  ImpactChainNode,
  OrganizationDashboard,
  ProjectDashboard,
  TaskCompletionStats,
} from '@/types'
import type {
  AttentionProjectResponseDTO,
  CriticalPathResponseDTO,
  CriticalPathSummaryResponseDTO,
  DelayAnalysisResponseDTO,
  DelayedItemResponseDTO,
  ImpactChainNodeDTO,
  OrganizationDashboardResponseDTO,
  ProjectDashboardResponseDTO,
  TaskCompletionStatsResponseDTO,
} from '@/types/dto/analytics-dto'
import { parseMoney } from '@/utils'

import {
  mapProjectDTOToProject,
  mapProjectHealthDTOToProjectHealth,
} from '../project/project-mappers'

function mapImpactChainNodeDTOToImpactChainNode(
  dto: ImpactChainNodeDTO,
): ImpactChainNode {
  return {
    taskId: dto.task_id,
    title: dto.title,
    status: dto.status,
    priority: dto.priority,
    progress: dto.progress,
    startDate: dto.start_date,
    dueDate: dto.due_date,
    delayDays: dto.delay_days,
    delayReason: dto.delay_reason,
    isBlocked: dto.is_blocked,
  }
}

function mapCriticalPathResponseDTOToCriticalPathItem(
  dto: CriticalPathResponseDTO,
): CriticalPathItem {
  return {
    id: dto.id,
    projectId: dto.project_id,
    code: dto.code,
    originTaskId: dto.origin_task_id,
    delayDays: dto.delay_days,
    delayCategory: dto.delay_category,
    affectedCount: dto.affected_count,
    impactChain: dto.impact_chain.map(mapImpactChainNodeDTOToImpactChainNode),
    isActive: dto.is_active,
    createdAt: dto.created_at,
  }
}

export function mapCriticalPathSummaryResponseDTOToCriticalPathSummary(
  dto: CriticalPathSummaryResponseDTO,
): CriticalPathSummary {
  return {
    totalCriticalPaths: dto.total_critical_paths,
    activeCriticalPaths: dto.active_critical_paths,
    criticalPaths: dto.critical_paths.map(
      mapCriticalPathResponseDTOToCriticalPathItem,
    ),
  }
}

export function mapProjectDashboardResponseDTOToProjectDashboard(
  dto: ProjectDashboardResponseDTO,
): ProjectDashboard {
  return {
    projectId: dto.project_id,
    projectName: dto.project_name,
    status: dto.status,
    priority: dto.priority,
    overallProgress: dto.overall_progress,
    tasksTotal: dto.tasks_total,
    tasksCompleted: dto.tasks_completed,
    tasksInProgress: dto.tasks_in_progress,
    tasksBlocked: dto.tasks_blocked,
    budget: dto.budget !== null ? parseMoney(dto.budget) : null,
    allocated: parseMoney(dto.allocated),
    spent: parseMoney(dto.spent),
    remaining: parseMoney(dto.remaining),
    isOverBudget: dto.is_over_budget,
    teamSize: dto.team_size,
    startDate: dto.start_date,
    dueDate: dto.due_date,
    criticalPathsCount: dto.critical_paths_count,
    problemsCount: dto.problems_count,
    health: mapProjectHealthDTOToProjectHealth(dto.health),
    delayedOrBlockedTasks: dto.delayed_or_blocked_tasks,
    criticalPathSlipDays: dto.critical_path_slip_days,
  }
}

function mapDelayedItemResponseDTOToDelayedItem(
  dto: DelayedItemResponseDTO,
): DelayedItem {
  return {
    taskId: dto.task_id,
    title: dto.title,
    delayDays: dto.delay_days,
    delayReason: dto.delay_reason,
    priority: dto.priority,
    isSubtask: dto.is_subtask,
    parentTitle: dto.parent_title,
  }
}

export function mapDelayAnalysisResponseDTOToDelayAnalysis(
  dto: DelayAnalysisResponseDTO,
): DelayAnalysis {
  return {
    totalDelayed: dto.total_delayed,
    delayByReason: dto.delay_by_reason,
    mostDelayed: dto.most_delayed.map(mapDelayedItemResponseDTOToDelayedItem),
    averageDelayDays: dto.average_delay_days,
  }
}

export function mapTaskCompletionStatsResponseDTOToTaskCompletionStats(
  dto: TaskCompletionStatsResponseDTO,
): TaskCompletionStats {
  return {
    periodStart: dto.period_start,
    periodEnd: dto.period_end,
    totalTasks: dto.total_tasks,
    completedTasks: dto.completed_tasks,
    completionRate: dto.completion_rate,
    averageProgress: dto.average_progress,
  }
}

export function mapOrganizationDashboardResponseDTOToOrganizationDashboard(
  dto: OrganizationDashboardResponseDTO,
): OrganizationDashboard {
  return {
    delayedProjects: dto.delayed_projects,
    delayedOrBlockedTasks: dto.delayed_or_blocked_tasks,
    criticalPathSlipDays: dto.critical_path_slip_days,
    oldestDraftAgeDays: dto.oldest_draft_age_days,
    projectsNeedingAttention: (dto.projects_needing_attention ?? []).map(
      mapAttentionProjectResponseDTOToAttentionProject,
    ),
  }
}

/**
 * The attention row IS a project now, so it reuses the project mapper whole.
 *
 * That reuse is the point: the home cannot end up with a differently-shaped —
 * or differently-judged — version of an obra the listing also shows.
 */
function mapAttentionProjectResponseDTOToAttentionProject(
  dto: AttentionProjectResponseDTO,
): AttentionProject {
  return {
    ...mapProjectDTOToProject(dto),
    delayedOrBlockedTasks: dto.delayed_or_blocked_tasks,
    criticalPathSlipDays: dto.critical_path_slip_days,
  }
}
