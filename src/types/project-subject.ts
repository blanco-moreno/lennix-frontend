import type { ProjectCurrency, ProjectHealth } from './project'
import type { ReviewStep } from './schedule-import'

/**
 * What a project card needs to render, in either density.
 *
 * Structural on purpose: `Project` satisfies it, and so does the dashboard's
 * `AttentionProject`, which carries no money and no draft flag. The optional
 * fields are the ones only the full `Project` has — the row degrades to what
 * its subject actually knows instead of the caller inventing zeroes.
 */
export interface ProjectSubject {
  id: string
  name: string
  status: string
  /**
   * The server's verdict — required, and the only thing the row colours from.
   *
   * Not optional on purpose: every project endpoint serves it, and an optional
   * verdict would invite a fallback that judges locally, which is the whole
   * defect this replaced.
   */
  health: ProjectHealth
  progress: number
  dueDate: string | null
  location?: string | null
  managerName?: string | null
  startDate?: string | null
  /** When the obra was created — a draft is read by how long it has waited. */
  createdAt?: string
  budget?: number | null
  /** What `budget` and `spent` are in; absent reads as USD (`BUD-10`). */
  currency?: ProjectCurrency
  spent?: number
  isOverBudget?: boolean
  isDraft?: boolean
  /** Where the import wizard was left — the draft row's "avance". */
  reviewStep?: ReviewStep | null
}
