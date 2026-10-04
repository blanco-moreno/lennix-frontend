/**
 * The narration receipt, derived from the draft's own review state.
 *
 * Every number here is checkable against the file: it counts rows that actually
 * landed, quotes section names verbatim, and states how many things Lennix had
 * to decide for the user. Nothing is rounded up into confidence — the receipt
 * exists so the import can be verified rather than believed.
 */

import type {
  AssumptionLedgerEntry,
  ScheduleReviewState,
  SheetEvidence,
} from '@/types'

/** What the receipt's clickable numbers point at. */
export type NarrationFocus = 'phases' | 'activities' | 'dates' | 'caveats'

export type CaveatKind =
  | 'assumption'
  | 'unresolved_edges'
  | 'skipped_edges'
  | 'unclassified_rows'
  | 'dropped_rows'

export interface NarrationCaveat {
  kind: CaveatKind
  /** Stable per-caveat key — the ledger cause, or the kind for the rest. */
  id: string
  /** Rows this caveat touches, so the user can weigh it before opening it. */
  affectedRows: number
  /** Present only for a ledger-derived caveat. */
  entry?: AssumptionLedgerEntry
}

export interface ImportNarration {
  fileName: string | null
  sheet: string | null
  /**
   * Why that sheet won, as facts — the receipt turns it into a sentence with
   * `useTrustCopy`. The contract's own `sheetReason` is English prose and is
   * never rendered.
   */
  sheetEvidence: SheetEvidence
  /** Main tasks that actually group work — a flat file has none. */
  phaseCount: number
  /** Section names exactly as the file writes them (never re-titled). */
  phaseNames: string[]
  /** Leaf work items: subtasks plus main tasks that carry no subtask. */
  activityCount: number
  startDate: string | null
  endDate: string | null
  /** Rows the user already corrected — what makes a resumed draft honest. */
  editedCount: number
  caveats: NarrationCaveat[]
  caveatCount: number
  /** Subtasks the 2-level model flattened from a deeper source hierarchy. */
  collapsedRows: number
  /** Levels the file nested, counting the phase — 2 is what the project keeps. */
  maxSourceDepth: number
}

function earliest(dates: (string | null)[]): string | null {
  const known = dates.filter((date): date is string => !!date)
  return known.length > 0 ? known.reduce((a, b) => (a < b ? a : b)) : null
}

function latest(dates: (string | null)[]): string | null {
  const known = dates.filter((date): date is string => !!date)
  return known.length > 0 ? known.reduce((a, b) => (a > b ? a : b)) : null
}

/**
 * Build the caveat list — "the things to check".
 *
 * One cause, one entry: a high-consequence assumption is a caveat however
 * confident the parser was, while cosmetic per-cell marks stay off the receipt.
 * Unresolved predecessors, the links the file stated but that never became an
 * edge, the unclassified bin and dropped rows each collapse into a single
 * caveat, because they are one question, not one per row.
 */
export function buildCaveats(state: ScheduleReviewState): NarrationCaveat[] {
  const caveats: NarrationCaveat[] = state.ledger
    .filter((entry) => entry.consequence === 'high')
    .map((entry) => ({
      kind: 'assumption' as const,
      id: `${entry.cause}:${entry.scope}`,
      affectedRows: entry.affectedRows,
      entry,
    }))

  if (state.unresolvedEdges.length > 0) {
    caveats.push({
      kind: 'unresolved_edges',
      id: 'unresolved_edges',
      affectedRows: state.unresolvedEdges.length,
    })
  }
  if (state.report.skippedEdgesTotal > 0) {
    caveats.push({
      kind: 'skipped_edges',
      id: 'skipped_edges',
      affectedRows: state.report.skippedEdgesTotal,
    })
  }
  if (state.report.unclassifiedTotal > 0) {
    caveats.push({
      kind: 'unclassified_rows',
      id: 'unclassified_rows',
      affectedRows: state.report.unclassifiedTotal,
    })
  }
  if (state.report.rowsDropped > 0) {
    caveats.push({
      kind: 'dropped_rows',
      id: 'dropped_rows',
      affectedRows: state.report.rowsDropped,
    })
  }

  return caveats
}

export function buildNarration(state: ScheduleReviewState): ImportNarration {
  const phases = state.tasks.filter((task) => task.subtasks.length > 0)
  const leaves = state.tasks.filter((task) => task.subtasks.length === 0)
  const activityCount =
    leaves.length +
    state.tasks.reduce((total, task) => total + task.subtasks.length, 0)

  const allDates = state.tasks.flatMap((task) => [
    task.startDate,
    task.dueDate,
    ...task.subtasks.flatMap((subtask) => [subtask.startDate, subtask.dueDate]),
  ])

  const caveats = buildCaveats(state)

  // The span is the ROWS' span — what the file actually says. The project's own
  // dates are only a fallback: they can be widened later by hand, and a receipt
  // that quotes them would stop matching the schedule it sits above.
  const rowStart = earliest(allDates)
  const rowEnd = latest(allDates)

  return {
    fileName: state.scheduleImport?.sourceFilename ?? null,
    sheet: state.scheduleImport?.sheet ?? null,
    sheetEvidence: state.report.sheetEvidence,
    phaseCount: phases.length,
    phaseNames: phases.map((task) => task.title),
    activityCount,
    startDate: rowStart ?? state.project.startDate,
    endDate: rowEnd ?? state.project.dueDate,
    editedCount: state.stats.editedTasks,
    caveats,
    caveatCount: caveats.length,
    collapsedRows: state.stats.collapsedRows,
    // The backend counts depth BELOW the phase, so a grandchild is 2 and the
    // file itself nests 3. The receipt speaks levels, not offsets.
    maxSourceDepth: state.stats.maxSourceDepth + 1,
  }
}
