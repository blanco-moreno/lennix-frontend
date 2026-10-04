/**
 * Contract facts → sentences in the user's language. ms-ai's English prose must
 * never reach the screen: the wire prose fields are debug-only and unread here.
 */

import { useIntl, type IntlShape } from 'react-intl'

import type {
  AssumptionLedgerEntry,
  DateColumnCode,
  ParseQuality,
  SheetEvidence,
  SheetReasonCode,
  SkippedEdgeReason,
} from '@/types'

import { trustCopyMessages as m } from './use-trust-copy-messages'

const DATE_FORMAT_MESSAGES = {
  DMY: m.dateFormatDmy,
  MDY: m.dateFormatMdy,
  ISO: m.dateFormatIso,
  native: m.dateFormatNative,
  unknown: m.dateFormatUnknown,
} as const

const COLUMN_MESSAGES: Record<DateColumnCode, (typeof m)['columnStart']> = {
  start: m.columnStart,
  finish: m.columnFinish,
  actual_start: m.columnActualStart,
  actual_finish: m.columnActualFinish,
  constraint_date: m.columnConstraintDate,
}

const UNCLASSIFIED_CAUSE_MESSAGES = {
  unplaced: m.unclassifiedUnplaced,
  dropped_header: m.unclassifiedDroppedHeader,
  dropped_total: m.unclassifiedDroppedTotal,
} as const

const SKIPPED_EDGE_MESSAGES: Record<
  SkippedEdgeReason,
  (typeof m)['skippedMalformed']
> = {
  type_not_stated: m.skippedTypeNotStated,
  unknown_type: m.skippedUnknownType,
  unconvertible_lag: m.skippedUnconvertibleLag,
  lag_out_of_range: m.skippedLagOutOfRange,
  unresolved_reference: m.skippedUnresolvedReference,
  no_key_column: m.skippedNoKeyColumn,
  external_reference: m.skippedExternalReference,
  truncated: m.skippedTruncated,
  malformed: m.skippedMalformed,
  self_loop: m.skippedSelfLoop,
  duplicate: m.skippedDuplicate,
  cycle: m.skippedCycle,
  marked_for_deletion: m.skippedMarkedForDeletion,
}

const DROP_REASON_MESSAGES = {
  empty: m.dropEmpty,
  header: m.dropHeader,
  total: m.dropTotal,
} as const

/**
 * A date-order token in words.
 *
 * An unrecognized token falls back to the token itself: `DMY` is already
 * readable, and inventing a translation for a value ms-ai has not documented
 * would be worse than quoting it.
 */
function dateFormat(intl: IntlShape, value: string): string {
  const message =
    DATE_FORMAT_MESSAGES[value as keyof typeof DATE_FORMAT_MESSAGES]
  return message ? intl.formatMessage(message) : value
}

/** A date column named in the user's language; unknown columns keep their token. */
function dateColumn(intl: IntlShape, scope: string): string {
  const message = COLUMN_MESSAGES[scope as DateColumnCode]
  return message ? intl.formatMessage(message) : scope
}

function sheetEvidenceFragment(
  intl: IntlShape,
  code: SheetReasonCode,
  evidence: SheetEvidence,
): string | null {
  switch (code) {
    case 'name_matches_schedule':
      return intl.formatMessage(m.sheetNameMatchesSchedule)
    case 'name_matches_companion':
      return intl.formatMessage(m.sheetNameMatchesCompanion)
    case 'name_neutral':
      return intl.formatMessage(m.sheetNameNeutral)
    case 'has_schedule_header':
      // The row number travels beside the code precisely so this reads as a
      // fact rather than a claim; without it the code says nothing useful.
      return evidence.headerRow === null
        ? null
        : intl.formatMessage(m.sheetHasScheduleHeader, {
            row: evidence.headerRow,
          })
    case 'has_day_grid':
      return evidence.dayGridColumns === null
        ? null
        : intl.formatMessage(m.sheetHasDayGrid, {
            columns: evidence.dayGridColumns,
          })
    case 'no_schedule_header':
      return intl.formatMessage(m.sheetNoScheduleHeader)
    case 'no_rows_under_header':
      return intl.formatMessage(m.sheetNoRowsUnderHeader)
  }
}

export interface TrustCopy {
  /** What Lennix decided, as a clause — the blast radius is added by the caller. */
  ledgerAssumption: (entry: AssumptionLedgerEntry) => string
  /** The other reading, or the act the reader can take. `null` when neither. */
  ledgerAlternative: (entry: AssumptionLedgerEntry) => string | null
  /** Why this worksheet won, from its evidence codes. */
  sheetReason: (evidence: SheetEvidence) => string | null
  /** How much of the file landed on the timeline. */
  qualitySummary: (quality: ParseQuality) => string
  /** The drop reasons behind "N rows were left out", as one translated list. */
  dropReasons: (reasons: string[]) => string
  /** Why a binned row could not be placed. */
  unclassifiedCause: (cause: string) => string
  /** Why a relationship the file states did not become an edge. */
  skippedEdgeReason: (reason: SkippedEdgeReason) => string
}

export function useTrustCopy(): TrustCopy {
  const intl = useIntl()
  const separator = intl.formatMessage(m.listSeparator)

  return {
    ledgerAssumption(entry) {
      switch (entry.cause) {
        case 'date_format':
          return intl.formatMessage(m.causeDateFormat, {
            column: dateColumn(intl, entry.scope),
            format: dateFormat(intl, entry.chosen),
          })
        case 'sheet_choice':
          // `chosen` is the worksheet's own name, quoted from the file.
          return intl.formatMessage(m.causeSheetChoice, { sheet: entry.chosen })
        case 'day_grid_year':
          return intl.formatMessage(m.causeDayGridYear)
        case 'hierarchy_signal':
          return intl.formatMessage(m.causeHierarchySignal)
        case 'edge_ref':
          return intl.formatMessage(m.causeEdgeRef)
        case 'llm_mapping':
          return intl.formatMessage(m.causeLlmMapping)
        case 'locale':
          return intl.formatMessage(m.causeLocale, { locale: entry.chosen })
      }
    },

    ledgerAlternative(entry) {
      switch (entry.alternativeAction) {
        case 'flip_date_order':
          return entry.alternativeValue === null
            ? null
            : intl.formatMessage(m.alternativeReading, {
                value: dateFormat(intl, entry.alternativeValue),
              })
        case 'switch_sheet':
          return entry.alternativeValue === null
            ? null
            : intl.formatMessage(m.alternativeSheet, {
                sheet: entry.alternativeValue,
              })
        case 'group_rows_manually':
          return intl.formatMessage(m.alternativeGroupRows)
        case 'confirm_edge_candidates':
          return intl.formatMessage(m.alternativeConfirmEdges)
        case 'state_the_year':
          return intl.formatMessage(m.alternativeStateYear)
        case 'none':
          return null
      }
    },

    sheetReason(evidence) {
      const fragments = evidence.codes
        .map((code) => sheetEvidenceFragment(intl, code, evidence))
        .filter((fragment): fragment is string => fragment !== null)
      if (fragments.length === 0) return null
      return intl.formatMessage(m.sheetReason, {
        reasons: fragments.join(separator),
      })
    },

    qualitySummary(quality) {
      return intl.formatMessage(m.qualitySummary, {
        scheduled: quality.scheduledRows,
        work: quality.workRows,
      })
    },

    unclassifiedCause(cause) {
      const message =
        UNCLASSIFIED_CAUSE_MESSAGES[
          cause as keyof typeof UNCLASSIFIED_CAUSE_MESSAGES
        ]
      return message ? intl.formatMessage(message) : cause
    },

    skippedEdgeReason(reason) {
      return intl.formatMessage(SKIPPED_EDGE_MESSAGES[reason])
    },

    dropReasons(reasons) {
      return reasons
        .map((reason) => {
          const message =
            DROP_REASON_MESSAGES[reason as keyof typeof DROP_REASON_MESSAGES]
          return message ? intl.formatMessage(message) : reason
        })
        .join(separator)
    },
  }
}
