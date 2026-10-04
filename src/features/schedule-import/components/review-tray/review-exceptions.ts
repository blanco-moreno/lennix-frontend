/**
 * Derives the review band's items from review state: the parser's
 * high-consequence assumptions, what it could not resolve, and the
 * relationships the file stated that never became an edge. Only discards are
 * read from the local journal.
 */

import type {
  ReviewTask,
  ReviewUnresolvedEdge,
  ScheduleReviewState,
  SkippedEdge,
  UnclassifiedRow,
} from '@/types'

import {
  buildLedgerView,
  type LedgerCause,
} from '../assumption-ledger/ledger-model'

import type { ReviewJournal } from './review-journal'
import { normalizeName } from './text-match'

export type ReviewExceptionKind =
  | 'assumption'
  | 'unclassified_row'
  | 'unresolved_edge'
  | 'skipped_edges'

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

/** A loud ledger cause: a decision with a viable other reading (`IMP-5`). */
export interface AssumptionException extends ReviewExceptionBase {
  kind: 'assumption'
  blocking: false
  cause: LedgerCause
}

/** Every relationship the file stated that never became an edge, as one item. */
export interface SkippedEdgesException extends ReviewExceptionBase {
  kind: 'skipped_edges'
  blocking: false
  edges: SkippedEdge[]
  /** The full count — `edges` is capped by the parser. */
  total: number
}

export type ReviewException =
  | AssumptionException
  | UnclassifiedRowException
  | UnresolvedEdgeException
  | SkippedEdgesException

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
 * Build the band.
 *
 * Order is by consequence: readings that move many dates, the rows that never
 * landed, the dependency questions, then what the file stated but did not
 * carry. Nothing here blocks go-live — ms-bk creates the mirror subactivity a
 * childless main task needs on activation.
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

  // An edge whose successor row is not on the canvas — never landed, or
  // deleted since — has no row to answer it on, so it is not offered.
  const withDependency = new Set(state.dependencies.map((dep) => dep.taskId))
  const onCanvas = new Set(allReviewRows(state.tasks).map((row) => row.id))
  const edges: UnresolvedEdgeException[] = state.unresolvedEdges
    .filter(
      (edge): edge is ReviewUnresolvedEdge & { successorTaskId: string } =>
        edge.successorTaskId !== null && onCanvas.has(edge.successorTaskId),
    )
    .filter((edge) => !withDependency.has(edge.successorTaskId))
    .map((edge) => ({
      id: `unresolved_edge:${edge.successorRef}`,
      kind: 'unresolved_edge',
      blocking: false,
      edge,
      successorTaskId: edge.successorTaskId,
    }))

  const assumptions: AssumptionException[] = buildLedgerView(state).loud.map(
    (cause) => ({
      id: `assumption:${cause.entry.cause}:${cause.entry.scope}`,
      kind: 'assumption',
      blocking: false,
      cause,
    }),
  )

  const { skippedEdges, skippedEdgesTotal } = state.report
  const skipped: SkippedEdgesException[] =
    skippedEdgesTotal > 0
      ? [
          {
            id: 'skipped_edges',
            kind: 'skipped_edges',
            blocking: false,
            edges: skippedEdges,
            total: skippedEdgesTotal,
          },
        ]
      : []

  return [...assumptions, ...unclassified, ...edges, ...skipped]
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
