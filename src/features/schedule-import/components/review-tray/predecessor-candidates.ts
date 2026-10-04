/**
 * Ranks candidate rows for a predecessor name that matched nothing.
 * Only rows the backend would accept are offered: the pairing rule
 * (`inter_phase` / `intra_phase`), and no link that repeats an edge or closes
 * a loop in the draft's current graph.
 */

import type { ReviewTask, ReviewUnresolvedEdge } from '@/types'
import { buildUpstreamGraph, evaluateLink, type ExistingEdge } from '@/utils'

import { allReviewRows } from './review-exceptions'
import { normalizeName, similarity } from './text-match'

export interface PredecessorOption {
  taskId: string
  title: string
  ref: string | null
  /** True when the parser itself proposed this row as a candidate. */
  proposed: boolean
  /** Best similarity against the raw text or any proposed candidate, 0–1. */
  score: number
}

/** Below this a name match is noise, not a suggestion. */
export const CANDIDATE_FLOOR = 0.34

/**
 * Rank every row that could legally precede `edge`'s successor.
 *
 * A row proposed by the parser outranks a merely similar one; ties break on
 * similarity. The successor itself is never offered — a row cannot precede
 * itself, and the picker is the only place this edge can be resolved.
 */
export function buildPredecessorOptions(
  edge: ReviewUnresolvedEdge,
  tasks: ReviewTask[],
  existing: ExistingEdge[] = [],
): PredecessorOption[] {
  const rows = allReviewRows(tasks)
  const successor = rows.find((row) => row.id === edge.successorTaskId)
  if (!successor) return []

  const linkable = new Map(rows.map((row) => [row.id, row]))
  const graph = buildUpstreamGraph(existing)
  const proposedNames = edge.candidates.map(normalizeName)
  const needles = [edge.sourceText, ...edge.candidates].filter(
    (value): value is string => !!value,
  )

  return rows
    .flatMap((row) => {
      const verdict = evaluateLink(
        { predecessorId: row.id, successorId: successor.id },
        linkable,
        existing,
        graph,
      )
      if (!verdict.ok) return []

      const proposed =
        proposedNames.includes(normalizeName(row.title)) ||
        (row.ref !== null && edge.candidates.includes(row.ref))
      const score = needles.reduce(
        (best, needle) => Math.max(best, similarity(needle, row.title)),
        0,
      )

      return [
        {
          taskId: row.id,
          title: row.title,
          ref: row.ref,
          proposed,
          score,
        },
      ]
    })
    .sort((a, b) => {
      if (a.proposed !== b.proposed) return a.proposed ? -1 : 1
      return b.score - a.score
    })
}

/** The rows worth showing first: proposed by the parser, or close enough. */
export function suggestedOptions(
  options: PredecessorOption[],
): PredecessorOption[] {
  return options.filter(
    (option) => option.proposed || option.score >= CANDIDATE_FLOOR,
  )
}
