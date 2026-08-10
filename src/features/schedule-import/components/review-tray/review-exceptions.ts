/**
 * Derives the tray's exceptions — what the parser could not resolve — from review
 * state; only discard and mirror acceptance are read from the local journal.
 */

import type {
  ReviewTask,
  ReviewUnresolvedEdge,
  ScheduleReviewState,
  UnclassifiedRow,
} from '@/types'

import type { ReviewJournal } from './review-journal'
import { normalizeName } from './text-match'

export type ReviewExceptionKind = 'unclassified_row' | 'unresolved_edge'

interface ReviewExceptionBase {
  /** Stable across reloads — the tray re-derives, it never re-numbers. */
  id: string
  kind: ReviewExceptionKind
  /** Blocking exceptions hold Activate; the rest are optional. */
  blocking: boolean
}

export interface UnclassifiedRowException extends ReviewExceptionBase {
  kind: 'unclassified_row'
  blocking: false
  row: UnclassifiedRow
}

export interface UnresolvedEdgeException extends ReviewExceptionBase {
  kind: 'unresolved_edge'
  blocking: false
  edge: ReviewUnresolvedEdge
  /** The row the predecessor was written on — always known here. */
  successorTaskId: string
}

export type ReviewException = UnclassifiedRowException | UnresolvedEdgeException

/** `sheet:row` — the row's own address in the user's file. */
export function unclassifiedRowId(row: UnclassifiedRow): string {
  return `${row.sheet}:${row.row}`
}

export interface ReviewRow {
  id: string
  title: string
  ref: string | null
  /** Null for a phase; the phase's id for an activity under it. */
  parentId: string | null
}

/** Every row currently on the canvas, parents and children alike. */
export function allReviewRows(tasks: ReviewTask[]): ReviewRow[] {
  return tasks.flatMap((task) => [
    { id: task.id, title: task.title, ref: task.ref, parentId: null },
    ...task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      ref: subtask.ref,
      parentId: task.id,
    })),
  ])
}

/**
 * Build the tray.
 *
 * Order is by consequence: the rows that never landed, then the optional
 * dependency questions. Nothing here blocks go-live any more — ms-bk creates
 * the mirror subactivity a childless main task needs on activation, so asking
 * the user to accept it was asking permission for something already decided.
 */
export function buildReviewExceptions(
  state: ScheduleReviewState,
  journal: ReviewJournal,
): ReviewException[] {
  // A binned row is placed when a row by that name exists on the canvas — the
  // subtask the user created for it IS the resolution, so nothing else records
  // one. Names are compared normalized because the file rarely repeats itself
  // character for character.
  const landedNames = new Set(
    allReviewRows(state.tasks).map((row) => normalizeName(row.title)),
  )
  const unclassified: UnclassifiedRowException[] = state.report.unclassified
    .filter((row) => !journal.discardedRows.includes(unclassifiedRowId(row)))
    .filter((row) => !landedNames.has(normalizeName(row.text)))
    .map((row) => ({
      id: `unclassified_row:${unclassifiedRowId(row)}`,
      kind: 'unclassified_row',
      blocking: false,
      row,
    }))

  // An edge whose successor row is not on the canvas has nothing to attach to,
  // so the tray does not pretend it is answerable — it stays a receipt caveat.
  const withDependency = new Set(state.dependencies.map((dep) => dep.taskId))
  const edges: UnresolvedEdgeException[] = state.unresolvedEdges
    .filter(
      (edge): edge is ReviewUnresolvedEdge & { successorTaskId: string } =>
        edge.successorTaskId !== null,
    )
    .filter((edge) => !withDependency.has(edge.successorTaskId))
    .map((edge) => ({
      id: `unresolved_edge:${edge.successorRef}`,
      kind: 'unresolved_edge',
      blocking: false,
      edge,
      successorTaskId: edge.successorTaskId,
    }))

  return [...unclassified, ...edges]
}

/**
 * How many exceptions hold go-live back.
 *
 * Zero for every kind the tray currently raises — an unplaced row and an
 * unmatched predecessor are both optional. The count stays because "what
 * blocks" is the mechanism the wizard gates its last step on, not because a
 * blocking kind happens to exist today.
 */
export function countBlocking(exceptions: ReviewException[]): number {
  return exceptions.filter((exception) => exception.blocking).length
}
