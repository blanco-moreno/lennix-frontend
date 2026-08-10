/**
 * Task domain types — matches the backend contract for /v1/tasks.
 */

import type { Subtask } from './subtask'

export interface Task {
  id: string
  projectId: string
  /** The obra this activity belongs to — the name rides the row. */
  projectName: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  budget: number | null
  progress: number
  startDate: string | null
  dueDate: string | null
  spent: number
  isOverBudget: boolean
  delayReason: string | null
  delayDays: number
  isDraft: boolean
  isBlocked: boolean
  isCriticalPath: boolean
  assigneeId: string | null
  assigneeName: string | null
  forceStarted: boolean
  /**
   * Permanent provenance of an approved force-start. `forceStarted` is the
   * override *input* (a force-block clears it); `atRisk` never self-clears, so
   * the badge on this task outlives the block it overrode.
   */
  atRisk: boolean
  createdAt: string
  subtasks: Subtask[]
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high'

/**
 * Sort keys the task listings accept — mirrors `TaskSortBy` in
 * `lennix-ms-bk/app/tasks/constants.py`, a leading `-` meaning descending. A
 * key the backend does not know is a 422, so this union is contract, not a
 * convenience. `priority` sorts by real severity (low < medium < high) through
 * a SQL CASE, never alphabetically.
 */
export type TaskSortBy =
  | 'created_at'
  | '-created_at'
  | 'due_date'
  | '-due_date'
  | 'title'
  | '-title'
  | 'priority'
  | '-priority'
  | 'delay_days'
  | '-delay_days'

/**
 * The one server-side risk lens: `at_risk` means late *or* blocked — the exact
 * predicate behind the problems KPI, so the list and the KPI cannot disagree.
 */
export type TaskRiskFilter = 'at_risk'

export interface TaskFilters {
  searchTerm: string
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
}
