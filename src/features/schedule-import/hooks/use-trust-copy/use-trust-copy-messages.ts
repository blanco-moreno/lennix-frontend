import { defineMessages } from 'react-intl'

/**
 * Every word the import's trust outputs are read in.
 *
 * The contract ships no sentences: ms-ai has no locale and no user, so it
 * emits tokens and counts and the frontend owns the prose. These messages are
 * the other half of that deal — one per member of the
 * closed sets in `types/schedule-import.ts`, so a cause, a sheet verdict or a
 * drop reason can never reach a user as an English token.
 */
export const trustCopyMessages = defineMessages({
  // --- date-format tokens -------------------------------------------------
  dateFormatDmy: {
    id: 'trustCopy.dateFormat.dmy',
    defaultMessage: 'day/month/year',
    description: 'The DMY date-order token, in words',
  },
  dateFormatMdy: {
    id: 'trustCopy.dateFormat.mdy',
    defaultMessage: 'month/day/year',
    description: 'The MDY date-order token, in words',
  },
  dateFormatIso: {
    id: 'trustCopy.dateFormat.iso',
    defaultMessage: 'year-month-day',
    description: 'The ISO date-order token, in words',
  },
  dateFormatNative: {
    id: 'trustCopy.dateFormat.native',
    defaultMessage: 'the spreadsheet’s own date values',
    description: 'Dates that were already real date cells',
  },
  dateFormatUnknown: {
    id: 'trustCopy.dateFormat.unknown',
    defaultMessage: 'an order I could not determine',
    description: 'Fallback when no date order was established',
  },

  // --- date columns -------------------------------------------------------
  columnStart: {
    id: 'trustCopy.column.start',
    defaultMessage: 'start',
    description: 'The start date column, named in the user’s language',
  },
  columnFinish: {
    id: 'trustCopy.column.finish',
    defaultMessage: 'finish',
    description: 'The finish date column',
  },
  columnActualStart: {
    id: 'trustCopy.column.actualStart',
    defaultMessage: 'actual start',
    description: 'The actual-start date column',
  },
  columnActualFinish: {
    id: 'trustCopy.column.actualFinish',
    defaultMessage: 'actual finish',
    description: 'The actual-finish date column',
  },
  columnConstraintDate: {
    id: 'trustCopy.column.constraintDate',
    defaultMessage: 'constraint date',
    description: 'The constraint date column',
  },

  // --- one clause per ledger cause ---------------------------------------
  causeDateFormat: {
    id: 'trustCopy.cause.dateFormat',
    defaultMessage: 'I read the {column} dates as {format}.',
    description: 'The assumption behind a date column’s reading',
  },
  causeSheetChoice: {
    id: 'trustCopy.cause.sheetChoice',
    defaultMessage: 'I used the “{sheet}” sheet.',
    description: 'The assumption behind which worksheet was read',
  },
  causeDayGridYear: {
    id: 'trustCopy.cause.dayGridYear',
    defaultMessage:
      'The day grid does not state a year, so I took it from the rest of the file.',
    description: 'The assumption behind a day grid with no year',
  },
  causeHierarchySignal: {
    id: 'trustCopy.cause.hierarchySignal',
    defaultMessage:
      'The file carries no readable hierarchy, so every row stayed at the same level.',
    description: 'The assumption behind a flat structure',
  },
  causeEdgeRef: {
    id: 'trustCopy.cause.edgeRef',
    defaultMessage:
      'Some predecessor references match no row, so I left them unlinked.',
    description: 'The assumption behind unresolved dependency references',
  },
  causeLlmMapping: {
    id: 'trustCopy.cause.llmMapping',
    defaultMessage:
      'I could not resolve this file’s layout, so my model rebuilt every row from what it read.',
    description:
      'The assumption behind a model-normalized import: the deterministic parse diverted and the model pass rebuilt the row set',
  },
  causeLocale: {
    id: 'trustCopy.cause.locale',
    defaultMessage: 'I read the file as being written in “{locale}”.',
    description: 'The assumption behind the language the file was read in',
  },

  // --- what the reader can do instead ------------------------------------
  alternativeReading: {
    id: 'trustCopy.alternative.reading',
    defaultMessage: 'The other reading: {value}',
    description: 'The alternative interpretation, when it is a reading',
  },
  alternativeSheet: {
    id: 'trustCopy.alternative.sheet',
    defaultMessage: 'The other candidate: the “{sheet}” sheet',
    description: 'The runner-up worksheet',
  },
  alternativeGroupRows: {
    id: 'trustCopy.alternative.groupRows',
    defaultMessage: 'You can group the rows by hand in the review tray.',
    description: 'What to do about a file with no hierarchy',
  },
  alternativeConfirmEdges: {
    id: 'trustCopy.alternative.confirmEdges',
    defaultMessage: 'You can confirm the candidate predecessors by hand.',
    description: 'What to do about unresolved dependency references',
  },
  alternativeStateYear: {
    id: 'trustCopy.alternative.stateYear',
    defaultMessage:
      'You can state the year explicitly when reviewing the dates.',
    description: 'What to do about a day grid with no year',
  },

  // --- why this worksheet -------------------------------------------------
  sheetReason: {
    id: 'trustCopy.sheet.reason',
    defaultMessage: 'Why this sheet: {reasons}.',
    description: 'Frame around the worksheet-choice evidence',
  },
  sheetNameMatchesSchedule: {
    id: 'trustCopy.sheet.nameMatchesSchedule',
    defaultMessage: 'its name points at a schedule',
    description: 'Sheet evidence: the name hints at a schedule',
  },
  sheetNameMatchesCompanion: {
    id: 'trustCopy.sheet.nameMatchesCompanion',
    defaultMessage: 'its name points at a companion sheet, not a schedule',
    description: 'Sheet evidence: the name hints at a budget or resource sheet',
  },
  sheetNameNeutral: {
    id: 'trustCopy.sheet.nameNeutral',
    defaultMessage: 'its name says nothing either way',
    description: 'Sheet evidence: a neutral sheet name',
  },
  sheetHasScheduleHeader: {
    id: 'trustCopy.sheet.hasScheduleHeader',
    defaultMessage: 'it carries a schedule header on row {row}',
    description: 'Sheet evidence: a schedule header was found',
  },
  sheetHasDayGrid: {
    id: 'trustCopy.sheet.hasDayGrid',
    defaultMessage:
      'it carries a day grid {columns, plural, one {# column} other {# columns}} wide',
    description: 'Sheet evidence: a day grid was found',
  },
  sheetNoScheduleHeader: {
    id: 'trustCopy.sheet.noScheduleHeader',
    defaultMessage: 'no sheet in the file carries a schedule header',
    description: 'Sheet evidence: nothing looked like a schedule',
  },
  sheetNoRowsUnderHeader: {
    id: 'trustCopy.sheet.noRowsUnderHeader',
    defaultMessage: 'there is a header but no row under it',
    description: 'Sheet evidence: an empty schedule table',
  },

  // --- why a row could not be placed --------------------------------------
  unclassifiedUnplaced: {
    id: 'trustCopy.unclassified.unplaced',
    defaultMessage: 'no signal placed it',
    description:
      'Bin reason: the row was read but no hierarchy signal placed it',
  },
  unclassifiedDroppedHeader: {
    id: 'trustCopy.unclassified.droppedHeader',
    defaultMessage: 'read as a repeated header',
    description: 'Bin reason: the row looked like a header band',
  },
  unclassifiedDroppedTotal: {
    id: 'trustCopy.unclassified.droppedTotal',
    defaultMessage: 'read as a footer total',
    description: 'Bin reason: the row looked like a footer aggregate',
  },

  // --- why a row was left out --------------------------------------------
  dropEmpty: {
    id: 'trustCopy.drop.empty',
    defaultMessage: 'empty rows',
    description: 'Drop reason: the name cell was empty',
  },
  dropHeader: {
    id: 'trustCopy.drop.header',
    defaultMessage: 'repeated headers',
    description: 'Drop reason: a repeated header band',
  },
  dropTotal: {
    id: 'trustCopy.drop.total',
    defaultMessage: 'footer totals',
    description: 'Drop reason: a footer aggregate',
  },

  // --- why a relationship in the file was not imported -------------------
  skippedTypeNotStated: {
    id: 'trustCopy.skippedEdge.typeNotStated',
    defaultMessage: 'the link type is not stated',
    description:
      'Skipped relationship: a predecessor list with ids and no FS/SS/FF/SF',
  },
  skippedUnknownType: {
    id: 'trustCopy.skippedEdge.unknownType',
    defaultMessage: 'a link type Lennix does not recognize',
    description: 'Skipped relationship: a type code outside FS/SS/FF/SF',
  },
  skippedUnconvertibleLag: {
    id: 'trustCopy.skippedEdge.unconvertibleLag',
    defaultMessage: 'a lag in a unit that cannot be converted to days',
    description:
      'Skipped relationship: elapsed, percent or an unknown unit on the lag',
  },
  skippedLagOutOfRange: {
    id: 'trustCopy.skippedEdge.lagOutOfRange',
    defaultMessage: 'a lag beyond the 365-day limit',
    description: 'Skipped relationship: the lag exceeds ±365 days',
  },
  skippedUnresolvedReference: {
    id: 'trustCopy.skippedEdge.unresolvedReference',
    defaultMessage: 'it points at no row in the schedule',
    description:
      'Skipped relationship: the predecessor matches no row and no candidate',
  },
  skippedNoKeyColumn: {
    id: 'trustCopy.skippedEdge.noKeyColumn',
    defaultMessage:
      'the column it refers to is not in the file; export it again with the ID column',
    description:
      'Skipped relationship: the id column the references point at is absent, so the file must be exported again with it',
  },
  skippedExternalReference: {
    id: 'trustCopy.skippedEdge.externalReference',
    defaultMessage: 'it points at another project or file',
    description: 'Skipped relationship: an external predecessor',
  },
  skippedTruncated: {
    id: 'trustCopy.skippedEdge.truncated',
    defaultMessage: 'the export cut the cell short',
    description: 'Skipped relationship: the exporter truncated the cell',
  },
  skippedMalformed: {
    id: 'trustCopy.skippedEdge.malformed',
    defaultMessage: 'it cannot be read as a link',
    description: 'Skipped relationship: the text follows no known grammar',
  },
  skippedSelfLoop: {
    id: 'trustCopy.skippedEdge.selfLoop',
    defaultMessage: 'the activity would wait on itself',
    description: 'Skipped relationship: predecessor and successor are one row',
  },
  skippedDuplicate: {
    id: 'trustCopy.skippedEdge.duplicate',
    defaultMessage: 'it repeats a link already imported',
    description: 'Skipped relationship: the same pair appears twice',
  },
  skippedCycle: {
    id: 'trustCopy.skippedEdge.cycle',
    defaultMessage: 'it would close a loop',
    description: 'Skipped relationship: importing it would create a cycle',
  },
  skippedMarkedForDeletion: {
    id: 'trustCopy.skippedEdge.markedForDeletion',
    defaultMessage: 'the file marks it for deletion',
    description:
      'Skipped relationship: a P6 row flagged "Delete This Row" in the export',
  },

  // --- how much of the file landed ---------------------------------------
  qualitySummary: {
    id: 'trustCopy.quality.summary',
    defaultMessage:
      '{scheduled} of {work, plural, one {# work row} other {# work rows}} landed on the timeline.',
    description: 'How much of the file resolved into a schedule',
  },

  /** Joins the fragments of a composed sentence (evidence, drop reasons). */
  listSeparator: {
    id: 'trustCopy.listSeparator',
    defaultMessage: '; ',
    description: 'Separator between fragments of a composed sentence',
  },
})
