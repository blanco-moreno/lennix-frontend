/** The activity-detail tab set; the open tab lives in the URL (`?tab=`). */

export const TASK_TABS = ['overview', 'subtasks', 'budget'] as const

export type TaskTab = (typeof TASK_TABS)[number]

export const TASK_TAB_PARAM = 'tab'

/** General is the activity home: anything unresolvable lands there. */
export const DEFAULT_TASK_TAB: TaskTab = 'overview'

interface ResolveOptions {
  /**
   * Budget is permission-gated (`task.tabs.budget.view`); a link to it must not
   * open an empty tab for someone who cannot see the numbers.
   */
  canViewBudget: boolean
}

export function resolveTaskTab(
  value: string | null | undefined,
  { canViewBudget }: ResolveOptions,
): TaskTab {
  const candidate = TASK_TABS.find((tab) => tab === value)
  if (!candidate) return DEFAULT_TASK_TAB
  if (candidate === 'budget' && !canViewBudget) return DEFAULT_TASK_TAB
  return candidate
}
