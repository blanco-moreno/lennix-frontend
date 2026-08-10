/** Turns the contract's ledger entries into the canvas view: loud vs quiet causes, flips, provenance. */

import type {
  AssumptionLedgerEntry,
  DateAssumption,
  ScheduleReviewState,
} from '@/types'

import type { DateColumn } from './date-order-flip'

/** The ledger cause a date column's reading was decided by. */
export const DATE_FORMAT_CAUSE = 'date_format'

export interface CauseProvenance {
  ref: string
  title: string | null
  sheet: string | null
  row: number | null
}

export interface LedgerCause {
  entry: AssumptionLedgerEntry
  /** Present when this cause is a date column with a live alternative. */
  flip: { column: DateColumn; assumption: DateAssumption } | null
  provenance: CauseProvenance[]
  /** Raw cell values the parser read, quoted verbatim from the file. */
  samples: string[]
}

export interface LedgerView {
  /** Dates, budgets, durations: always stated in full, with the alternative. */
  loud: LedgerCause[]
  /** Name cleanups and the like: a quiet mark, available but never shouted. */
  quiet: LedgerCause[]
}

/**
 * Pair each date-format cause with the report's assumption for that column.
 *
 * Both sides name the column with the same token (`start`, `finish`, …), so
 * the match is an equality.
 */
function pairDateCauses(
  entries: AssumptionLedgerEntry[],
  assumptions: DateAssumption[],
): Map<AssumptionLedgerEntry, DateAssumption> {
  const flippable = assumptions.filter(
    (assumption) => assumption.alternative !== null,
  )
  const pairs = new Map<AssumptionLedgerEntry, DateAssumption>()
  const taken = new Set<DateAssumption>()

  for (const entry of entries) {
    if (entry.cause !== DATE_FORMAT_CAUSE) continue
    const match = flippable.find(
      (assumption) =>
        !taken.has(assumption) && assumption.column === entry.scope,
    )
    if (match) {
      pairs.set(entry, match)
      taken.add(match)
    }
  }

  return pairs
}

function provenanceOf(
  entry: AssumptionLedgerEntry,
  state: ScheduleReviewState,
): CauseProvenance[] {
  const rows = state.tasks.flatMap((task) => [task, ...task.subtasks])

  return entry.sampleRowRefs.map((ref) => {
    const row = rows.find((candidate) => candidate.ref === ref)
    return {
      ref,
      title: row?.title ?? null,
      sheet: row?.source?.sheet ?? null,
      row: row?.source?.row ?? null,
    }
  })
}

export function buildLedgerView(state: ScheduleReviewState): LedgerView {
  const pairs = pairDateCauses(state.ledger, state.report.dateAssumptions)

  const causes: LedgerCause[] = state.ledger.map((entry) => {
    const assumption = pairs.get(entry)
    const column = (assumption?.column ?? entry.scope) as DateColumn

    return {
      entry,
      flip:
        assumption && (column === 'start' || column === 'finish')
          ? { column, assumption }
          : null,
      provenance: provenanceOf(entry, state),
      samples: assumption?.samples ?? [],
    }
  })

  return {
    loud: causes.filter((cause) => cause.entry.consequence === 'high'),
    quiet: causes.filter((cause) => cause.entry.consequence !== 'high'),
  }
}

/** Rows the parser left out on purpose — quiet, but never hidden. */
export function leftOutSummary(state: ScheduleReviewState): {
  dropped: number
  reasons: string[]
} {
  const reasons = [...new Set(state.report.dropped.map((row) => row.reason))]
  return { dropped: state.report.rowsDropped, reasons }
}
