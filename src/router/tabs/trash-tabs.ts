/**
 * The papelera's tab set and its URL contract.
 *
 * The same rule the project and the activity already follow
 * (`project-tabs.ts`, `task-tabs.ts`): the open tab lives in the URL (`?tab=`)
 * instead of component state, so a tab is linkable, survives a reload and comes
 * back with the browser's Back button. This surface was the last uncontrolled
 * `defaultValue` left in the app.
 */

export const TRASH_TABS = ['projects', 'tasks', 'expenses'] as const

export type TrashTab = (typeof TRASH_TABS)[number]

export const TRASH_TAB_PARAM = 'tab'

/** Projects first: it is the deletion with the largest blast radius. */
export const DEFAULT_TRASH_TAB: TrashTab = 'projects'

export function resolveTrashTab(value: string | null | undefined): TrashTab {
  return TRASH_TABS.find((tab) => tab === value) ?? DEFAULT_TRASH_TAB
}

export const TRASH_PAGE_PARAM = 'page'

/**
 * The 1-based page, from the URL.
 *
 * Anything that is not a whole number ≥ 1 — a hand-edited `?page=0`, a
 * `?page=abc`, a stale link — resolves to the first page rather than asking
 * the server for something it cannot answer.
 */
export function resolveTrashPage(value: string | null | undefined): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return parsed
}
