/**
 * The activity page's section vocabulary — and the decoder for the links
 * written back when the activity was a drawer over its project.
 *
 * The task is a page now (`/projects/:projectId/tasks/:taskId`),
 * and `?panel=<section>` names its active section there. The old form —
 * `/projects/:projectId?activity=<id>&panel=<section>` — still resolves:
 * project detail reads it with `resolveTaskPanel` and redirects to the
 * page, section preserved. `open` (and any unknown value) means "the page's
 * default section" — the subtask list, the daily work.
 */

export const TASK_PANEL_PARAM = 'panel'

/**
 * The page's address always carries the PARENT task id; a subtask
 * rides in this query param. The page answers it with the subtasks
 * section active and that row's card selected — and a subtask id that
 * arrives in the path is canonicalized into this form with a redirect.
 */
export const TASK_SUBTASK_PARAM = 'subtask'

/** `open` is the alias for "whichever section is the default". */
export const TASK_PANEL_OPEN = 'open'

// `overview` left the vocabulary: everything general about the activity
// lives in the page header now, always visible. An old `panel=overview`
// link resolves as unknown — the page opens at its default.
// Ordered as rendered: the default section leads.
export const TASK_PANEL_TABS = ['subtasks', 'dependencies', 'budget'] as const

export type TaskPanelTab = (typeof TASK_PANEL_TABS)[number]

export interface TaskPanelState {
  open: boolean
  /** `null` = no explicit section: the panel picks per what was clicked. */
  tab: TaskPanelTab | null
}

/**
 * Read the panel out of the URL. An unknown section — a stale link, a typo, or
 * a budget section the role may not see — opens the panel at its default
 * rather than refusing to open: the row the user asked for is still the answer.
 */
export function resolveTaskPanel(
  raw: string | null,
  { canViewBudget }: { canViewBudget: boolean },
): TaskPanelState {
  if (raw === null) return { open: false, tab: null }
  const known = (TASK_PANEL_TABS as readonly string[]).includes(raw)
  const tab = known ? (raw as TaskPanelTab) : null
  return {
    open: true,
    tab: tab === 'budget' && !canViewBudget ? null : tab,
  }
}
