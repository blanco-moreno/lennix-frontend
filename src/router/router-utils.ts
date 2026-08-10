import { LOCAL_STORAGE_KEYS, PATHS } from '@/constants'

import { TASK_PANEL_PARAM, TASK_SUBTASK_PARAM } from './task-panel'

/**
 * Build project detail path
 */
export function buildProjectDetailPath(projectId: string): string {
  return PATHS.PROJECT_DETAIL.replace(':projectId', projectId)
}

/**
 * Build a task's page path, inside its project. The path id is always
 * the PARENT task; a subtask rides as `?subtask=` and lands the
 * page on the subtasks section with that row selected. The optional
 * section lands the page on `?panel=` — same vocabulary as ever.
 */
export function buildTaskDetailPath(
  projectId: string,
  taskId: string,
  options: { section?: string; subtaskId?: string } = {},
): string {
  const path = PATHS.TASK_DETAIL.replace(':projectId', projectId).replace(
    ':taskId',
    taskId,
  )
  const params = new URLSearchParams()
  if (options.section) params.set(TASK_PANEL_PARAM, options.section)
  if (options.subtaskId) params.set(TASK_SUBTASK_PARAM, options.subtaskId)
  const search = params.toString()
  return search ? `${path}?${search}` : path
}

/**
 * Build the resumable review canvas path of a draft.
 */
export function buildDraftReviewPath(projectId: string): string {
  return PATHS.DRAFT_REVIEW.replace(':projectId', projectId)
}

/**
 * Build the assisted-mapping path of a diverted upload (Lane F).
 *
 * Keyed by the import job, not by a project: the quality floor diverts before
 * anything is landed, so there is no draft to address.
 */
export function buildAssistedMappingPath(jobId: string): string {
  return PATHS.IMPORT_ASSISTED_MAPPING.replace(':jobId', jobId)
}

/**
 * Get the last visited route from localStorage
 */
export function getLastVisitedRoute(): string | null {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_VISITED_ROUTE)
  } catch {
    return null
  }
}

/**
 * Save the current route to localStorage
 */
export function saveLastVisitedRoute(route: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_VISITED_ROUTE, route)
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Clear the last visited route from localStorage
 */
export function clearLastVisitedRoute(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_VISITED_ROUTE)
  } catch {
    // Silently fail if localStorage is not available
  }
}
