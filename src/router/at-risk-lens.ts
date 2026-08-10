import { PATHS } from '@/constants'

/**
 * The at-risk lens over `/tasks`: URL vocabulary shared by the tasks list
 * (which applies it) and the hero KPI (which links to it).
 */
export const TASK_RISK_PARAM = 'risk'

export const AT_RISK_LENS = 'at_risk'

/**
 * The predicate itself is deliberately absent: `GET /v1/tasks?risk=at_risk`
 * answers `delay_days > 0 OR is_blocked` server-side, over the whole
 * organization. A copy of it here could only narrow the page that arrived,
 * which is what made the list disagree with its own paginator.
 */

/**
 * The address the at-risk KPI links to: the portfolio list with the lens on.
 * The list tab, not the assigned one — the tile counts top-level activities
 * across every project.
 */
export function buildAtRiskTasksPath(): string {
  const query = new URLSearchParams({
    tab: 'list',
    [TASK_RISK_PARAM]: AT_RISK_LENS,
  })
  return `${PATHS.TASKS}?${query.toString()}`
}
