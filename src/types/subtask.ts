export interface Subtask {
  id: string
  parentId: string
  title: string
  description: string | null
  status: string
  priority: string
  progress: number
  startDate: string | null
  dueDate: string | null
  location: string | null
  assigneeId: string | null
  assigneeName: string | null
  spent: number
  delayReason: string | null
  delayDays: number
  isBlocked: boolean
  isCriticalPath: boolean
  forceStarted: boolean
  /** Permanent at-risk provenance — see the note on `Task.atRisk`. */
  atRisk: boolean
  /**
   * The mirror subactivity the backend creates for a bare imported phase, so
   * that every task has one — a normalization artifact, not the user's row.
   * Carried so a surface can hide or badge it.
   */
  systemGenerated: boolean
  createdAt: string
}

export type SubtaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'

/**
 * One activity in the cross-project "assigned to me" queue.
 *
 * The same entity as `Subtask`, carrying the names that tell the reader where
 * the row came from. They are server fields, not a client-side lookup: the
 * queue spans every project, so resolving a name per row in the browser would
 * be a fan-out over the portfolio for a list of twenty rows.
 *
 * Work is assignable at both levels, so a row may be a **first-level activity**
 * rather than a subactivity: `parentId` and `parentTitle` are then `null`,
 * there is no phase above it, and the obra alone is the row's context.
 */
export interface AssignedSubtask extends Omit<Subtask, 'parentId'> {
  /** `null` for a first-level activity — it hangs off the obra, not a phase. */
  parentId: string | null
  projectId: string
  projectName: string
  /** The phase the activity hangs off, or `null` when it is first-level. */
  parentTitle: string | null
}
