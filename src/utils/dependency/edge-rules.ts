/**
 * The one place that knows which pairs of rows can carry an edge.
 *
 * The backend accepts exactly two shapes — phase→phase (`inter_phase`) and two
 * activities under the same phase (`intra_phase`) — and rejects the rest with a
 * 400. Both the import review picker and the schedule's draw-to-link mirror
 * the rule so neither ever offers a link that comes back an error;
 * they mirror it *from here*, because two copies of a domain rule is how they
 * start disagreeing.
 */

import type { RelationshipType } from '@/types'

export type DependencyType = 'inter_phase' | 'intra_phase'

/** The only shape the rule needs: is this row a phase, or whose activity is it. */
export interface LinkableRow {
  parentId: string | null
}

/** `null` when the backend would refuse the pair. */
export function dependencyTypeFor(
  successor: LinkableRow,
  predecessor: LinkableRow,
): DependencyType | null {
  if (!successor.parentId && !predecessor.parentId) return 'inter_phase'
  if (
    successor.parentId &&
    predecessor.parentId &&
    successor.parentId === predecessor.parentId
  ) {
    return 'intra_phase'
  }
  return null
}

export type LinkRejection = 'self' | 'pairing' | 'duplicate' | 'cycle'

export interface ExistingEdge {
  taskId: string
  dependsOnId: string
}

export interface LinkAttempt {
  predecessorId: string
  successorId: string
}

export interface LinkVerdict {
  ok: boolean
  dependencyType: DependencyType | null
  reason: LinkRejection | null
  /**
   * On `cycle`, the row that proves it: the first hop of the chain that already
   * runs from the predecessor back to the successor. `null` when the chain is
   * the single inverse edge — then the two rows themselves are the whole story.
   */
  viaId?: string | null
}

/** Successor id → the ids it already waits for. The edge the server walks. */
export type UpstreamGraph = Map<string, string[]>

export function buildUpstreamGraph(existing: ExistingEdge[]): UpstreamGraph {
  const graph: UpstreamGraph = new Map()
  for (const edge of existing) {
    const predecessors = graph.get(edge.taskId)
    if (predecessors) predecessors.push(edge.dependsOnId)
    else graph.set(edge.taskId, [edge.dependsOnId])
  }
  return graph
}

/**
 * The chain that already runs from `from` up to `target`, or `null` when there
 * is none. Same walk the backend's `_has_circular_dependency` does: start at
 * the would-be predecessor and follow `depends_on` upwards. Reaching the
 * would-be successor means the new edge would close the loop.
 */
function upstreamPath(
  graph: UpstreamGraph,
  from: string,
  target: string,
): string[] | null {
  const cameFrom = new Map<string, string>()
  const seen = new Set([from])
  const queue = [from]
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const next of graph.get(current) ?? []) {
      if (seen.has(next)) continue
      seen.add(next)
      cameFrom.set(next, current)
      if (next === target) {
        const path = [target]
        for (let step = current; ; step = cameFrom.get(step)!) {
          path.unshift(step)
          if (step === from) return path
        }
      }
      queue.push(next)
    }
  }
  return null
}

/**
 * Everything the client can rule out before asking the server: a self-link, an
 * illegal pairing, an edge that already exists, and a cycle.
 *
 * The cycle check is the server's own walk over the *same* committed graph —
 * `GET /projects/{id}/dependencies` ships every edge of the project, so this is
 * the rule restated, not guessed. The server still answers 409 when two people
 * link at once; that race is the only case the prediction can miss.
 */
export function evaluateLink(
  attempt: LinkAttempt,
  rows: Map<string, LinkableRow>,
  existing: ExistingEdge[],
  graph: UpstreamGraph = buildUpstreamGraph(existing),
): LinkVerdict {
  if (attempt.predecessorId === attempt.successorId) {
    return { ok: false, dependencyType: null, reason: 'self', viaId: null }
  }
  const successor = rows.get(attempt.successorId)
  const predecessor = rows.get(attempt.predecessorId)
  if (!successor || !predecessor) {
    return { ok: false, dependencyType: null, reason: 'pairing', viaId: null }
  }
  const dependencyType = dependencyTypeFor(successor, predecessor)
  if (!dependencyType) {
    return { ok: false, dependencyType: null, reason: 'pairing', viaId: null }
  }
  const duplicate = existing.some(
    (edge) =>
      edge.taskId === attempt.successorId &&
      edge.dependsOnId === attempt.predecessorId,
  )
  if (duplicate) {
    return { ok: false, dependencyType, reason: 'duplicate', viaId: null }
  }
  const path = upstreamPath(graph, attempt.predecessorId, attempt.successorId)
  if (path) {
    return {
      ok: false,
      dependencyType,
      reason: 'cycle',
      viaId: path.length > 2 ? path[1] : null,
    }
  }
  return { ok: true, dependencyType, reason: null, viaId: null }
}

/** A row the picker can offer, with the two fields the rule and the list need. */
export interface CandidateRow extends LinkableRow {
  id: string
  title: string
}

export interface LinkCandidate {
  id: string
  title: string
  verdict: LinkVerdict
  /** Title behind {@link LinkVerdict.viaId}, resolved against the same rows. */
  via: string | null
}

export interface LinkCandidatesArgs {
  /** The row the surface is about — never offered as its own candidate. */
  pivotId: string
  /** `upstream` asks what the pivot may wait for, `downstream` what may wait on it. */
  direction: 'upstream' | 'downstream'
  rows: CandidateRow[]
  existing: ExistingEdge[]
}

/**
 * Every other row, judged. Rejected rows are kept with their reason rather than
 * dropped: a picker that hides a row the user knows exists sends them looking
 * for it, and the reason is what teaches the shape of the graph.
 *
 * Legal rows come first, each group keeping the order it arrived in (the
 * schedule's, by start date), so the list reads as "what you can do" before
 * "what you cannot".
 */
export function linkCandidates({
  pivotId,
  direction,
  rows,
  existing,
}: LinkCandidatesArgs): LinkCandidate[] {
  const rowMap = new Map<string, LinkableRow>(
    rows.map((row) => [row.id, { parentId: row.parentId }]),
  )
  const titles = new Map(rows.map((row) => [row.id, row.title]))
  const graph = buildUpstreamGraph(existing)

  const judged = rows
    .filter((row) => row.id !== pivotId)
    .map((row) => {
      const verdict = evaluateLink(
        direction === 'upstream'
          ? { predecessorId: row.id, successorId: pivotId }
          : { predecessorId: pivotId, successorId: row.id },
        rowMap,
        existing,
        graph,
      )
      return {
        id: row.id,
        title: row.title,
        verdict,
        via: verdict.viaId ? (titles.get(verdict.viaId) ?? null) : null,
      }
    })

  return [
    ...judged.filter((candidate) => candidate.verdict.ok),
    ...judged.filter((candidate) => !candidate.verdict.ok),
  ]
}

/** Lag bound the backend enforces (`MAX_LAG_DAYS`), mirrored for the input. */
export const MAX_LAG_DAYS = 365

export function clampLag(days: number): number {
  if (!Number.isFinite(days)) return 0
  return Math.max(-MAX_LAG_DAYS, Math.min(MAX_LAG_DAYS, Math.trunc(days)))
}

export const RELATIONSHIP_ORDER: readonly RelationshipType[] = [
  'FS',
  'SS',
  'FF',
  'SF',
]
