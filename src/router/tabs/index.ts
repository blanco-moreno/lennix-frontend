/**
 * Per-surface tab sets and their URL contracts — the `?tab=` / `?section=`
 * vocabulary. Each surface's param is a separate concept on purpose (see
 * docs/CONVENTIONS.md on the per-surface `tab` params), but the rule is
 * shared: the open tab lives in the URL, so it is linkable, survives a reload
 * and comes back with the browser's Back button.
 */
export { PROJECT_TAB_PARAM, resolveProjectTab } from './project-tabs'
export { TASK_TAB_PARAM, resolveTaskTab } from './task-tabs'
export {
  TASK_DASHBOARD_TAB_PARAM,
  resolveTaskDashboardTab,
} from './task-dashboard-tabs'
export {
  TRASH_TAB_PARAM,
  resolveTrashTab,
  TRASH_PAGE_PARAM,
  resolveTrashPage,
} from './trash-tabs'
export {
  APPROVAL_SECTION_PARAM,
  resolveApprovalSection,
  type ApprovalSection,
} from './approval-sections'
