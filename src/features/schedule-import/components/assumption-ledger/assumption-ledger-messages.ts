import { defineMessages } from 'react-intl'

export const assumptionLedgerMessages = defineMessages({
  title: {
    id: 'assumptionLedger.title',
    defaultMessage: 'What Lennix decided for you',
    description: 'Header of the assumption ledger',
  },
  subtitle: {
    id: 'assumptionLedger.subtitle',
    defaultMessage:
      'One entry per decision, not per cell. Each says what the other reading was.',
    description: 'Explains that the ledger is aggregated by cause',
  },
  entry: {
    id: 'assumptionLedger.entry',
    defaultMessage:
      '{assumption} Affects {rows, plural, one {# row} other {# rows}}.',
    description:
      'One assumption Lennix committed to, with its blast radius. `assumption` is composed by `trust-copy` from the contract facts — it is never the contract’s own English prose',
  },
  provenanceToggle: {
    id: 'assumptionLedger.provenanceToggle',
    defaultMessage: 'Where did this come from?',
    description: 'Opens the source rows behind an assumption',
  },
  provenanceRow: {
    id: 'assumptionLedger.provenanceRow',
    defaultMessage: '{title} — sheet {sheet}, row {row}',
    description: 'One source row behind an assumption',
  },
  provenanceRowUnknown: {
    id: 'assumptionLedger.provenanceRowUnknown',
    defaultMessage: 'Row {ref} of the file',
    description: 'A source row that is no longer on the canvas',
  },
  provenanceSamples: {
    id: 'assumptionLedger.provenanceSamples',
    defaultMessage: 'Read from the file: {samples}',
    description: 'The raw cell values the parser read, quoted verbatim',
  },
  quietTitle: {
    id: 'assumptionLedger.quietTitle',
    defaultMessage: 'Minor clean-ups',
    description: 'Header of the cosmetic, low-consequence assumptions',
  },
  leftOut: {
    id: 'assumptionLedger.leftOut',
    defaultMessage:
      '{count, plural, one {# row was} other {# rows were}} left out: {reasons}.',
    description: 'Quiet line stating the rows the parser dropped, and why',
  },
  flipAction: {
    id: 'assumptionLedger.flipAction',
    defaultMessage: 'Read it the other way',
    description: 'Applies the alternative reading of a date column',
  },
  flipping: {
    id: 'assumptionLedger.flipping',
    defaultMessage: 'Re-reading {done} of {total}…',
    description: 'Progress while the flip rewrites the column',
  },
  flipNothing: {
    id: 'assumptionLedger.flipNothing',
    defaultMessage:
      'Every date in this column reads the same either way — there is nothing to flip.',
    description: 'Shown when the alternative reading changes no row',
  },
  flipDone: {
    id: 'assumptionLedger.flipDone',
    defaultMessage:
      '{count, plural, one {# date was} other {# dates were}} re-read. One more flip puts them back.',
    description: 'Result of applying the alternative reading',
  },
  flipFailed: {
    id: 'assumptionLedger.flipFailed',
    defaultMessage:
      '{count, plural, one {# date} other {# dates}} could not be re-read. Try again.',
    description: 'Shown when part of the flip failed to save',
  },
  conflicts: {
    id: 'assumptionLedger.conflicts',
    defaultMessage:
      '{count, plural, one {# of your edits touches} other {# of your edits touch}} re-read cells — check them. They were kept as you left them.',
    description:
      'Edit-pinning report: hand edits are preserved and listed, never overwritten',
  },
  conflictRow: {
    id: 'assumptionLedger.conflictRow',
    defaultMessage:
      '{title}: yours {current} · re-read would say {wouldBecome}',
    description: 'One pinned row a global re-read would have rewritten',
  },
  settled: {
    id: 'assumptionLedger.settled',
    defaultMessage:
      '{count, plural, one {# date reads} other {# dates read}} the same either way.',
    description: 'Rows the file itself settles, so the flip leaves them alone',
  },
})
