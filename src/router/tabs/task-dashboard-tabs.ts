/**
 * The `/tasks` tab set; the selected tab lives in the URL (`?tab=`).
 * Both tabs are visible to every role — deliberately no permission argument in
 * `resolveTaskDashboardTab`, unlike `project-tabs.ts` and `task-tabs.ts`.
 */

export const TASK_DASHBOARD_TABS = ['list', 'assigned'] as const

export type TaskDashboardTab = (typeof TASK_DASHBOARD_TABS)[number]

export const TASK_DASHBOARD_TAB_PARAM = 'tab'

/** The portfolio list is the page's home: anything unresolvable lands there. */
export const DEFAULT_TASK_DASHBOARD_TAB: TaskDashboardTab = 'list'

export function resolveTaskDashboardTab(
  value: string | null | undefined,
): TaskDashboardTab {
  return (
    TASK_DASHBOARD_TABS.find((tab) => tab === value) ??
    DEFAULT_TASK_DASHBOARD_TAB
  )
}
