import { defineMessages } from 'react-intl'

export const assistedMappingMessages = defineMessages({
  title: {
    id: 'assistedMapping.title',
    defaultMessage: 'Lennix could not turn {fileName} into a schedule',
    description: 'Humble headline of the assisted-mapping view',
  },
  subtitle: {
    id: 'assistedMapping.subtitle',
    defaultMessage:
      'Rather than show you a schedule built on guesses, here is exactly what Lennix did read from the file.',
    description: 'Why the user is here instead of on a Gantt',
  },
  whyTitle: {
    id: 'assistedMapping.whyTitle',
    defaultMessage: 'Why it stopped',
    description: 'Section heading for the quality-floor reasons',
  },
  reasonNoScheduleTable: {
    id: 'assistedMapping.reasonNoScheduleTable',
    defaultMessage: 'No sheet in the file carries a schedule table.',
    description: 'Quality-floor reason: no_schedule_table',
  },
  reasonNoRows: {
    id: 'assistedMapping.reasonNoRows',
    defaultMessage: 'A header was found, but there were no rows under it.',
    description: 'Quality-floor reason: no_rows',
  },
  reasonLowResolution: {
    id: 'assistedMapping.reasonLowResolution',
    defaultMessage:
      'Too few rows resolved into tasks ({ratio} of {threshold} needed).',
    description: 'Quality-floor reason: low_resolution',
  },
  reasonNoScheduleSignal: {
    id: 'assistedMapping.reasonNoScheduleSignal',
    defaultMessage: 'The file carries no dates, bars or durations to schedule.',
    description: 'Quality-floor reason: no_schedule_signal',
  },
  whatWasReadTitle: {
    id: 'assistedMapping.whatWasReadTitle',
    defaultMessage: 'What Lennix read',
    description: 'Section heading for the parse report summary',
  },
  rowsScanned: {
    id: 'assistedMapping.rowsScanned',
    defaultMessage:
      '{count, plural, one {# row scanned} other {# rows scanned}}',
    description: 'How many rows the parser looked at',
  },
  rowsImported: {
    id: 'assistedMapping.rowsImported',
    defaultMessage: '{count, plural, one {# row read} other {# rows read}}',
    description: 'How many rows the parser could read',
  },
  rowsDropped: {
    id: 'assistedMapping.rowsDropped',
    defaultMessage:
      '{count, plural, one {# row left out} other {# rows left out}}',
    description: 'How many rows the parser dropped',
  },
  unplacedTitle: {
    id: 'assistedMapping.unplacedTitle',
    defaultMessage: 'Rows it could not place',
    description: 'Section heading for the unclassified bin',
  },
  unplacedRow: {
    id: 'assistedMapping.unplacedRow',
    defaultMessage: 'Row {row}: “{text}”',
    description: 'One row from the unclassified bin, quoted verbatim',
  },
  unplacedMore: {
    id: 'assistedMapping.unplacedMore',
    defaultMessage:
      '…and {count, plural, one {# more row} other {# more rows}}.',
    description:
      'Says the bin list is capped rather than pretending it is whole',
  },
  mappingSoonTitle: {
    id: 'assistedMapping.mappingSoonTitle',
    defaultMessage: 'Manual column mapping is coming',
    description: 'Honest note about the part of assisted mapping not built yet',
  },
  mappingSoonBody: {
    id: 'assistedMapping.mappingSoonBody',
    defaultMessage:
      'For now, importing a file whose columns Lennix can read — task names with start and finish dates — is the fastest way through.',
    description: 'What the user can do today',
  },
  importAnother: {
    id: 'assistedMapping.importAnother',
    defaultMessage: 'Import another file',
    description: 'Action returning to the upload canvas',
  },
  notFoundTitle: {
    id: 'assistedMapping.notFoundTitle',
    defaultMessage: 'This import could not be found',
    description: 'Error state when the job id does not resolve',
  },
  notFoundDescription: {
    id: 'assistedMapping.notFoundDescription',
    defaultMessage: 'It may have expired. Import the file again.',
    description: 'Guidance when the job is missing',
  },
})
