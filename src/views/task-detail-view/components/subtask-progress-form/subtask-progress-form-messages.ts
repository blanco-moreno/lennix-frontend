import { defineMessages } from 'react-intl'

/** Catalog for the subtask progress modal — wording only it renders. */
export const subtaskProgressModalMessages = defineMessages({
  progressOutcomeNote: {
    id: 'taskDetail.progressOutcomeNote',
    defaultMessage:
      'On save it becomes {status}. Reporting 100% completes it automatically.',
    description:
      'The status as a consequence of the reported percentage, never as an input',
  },
  progressDelayNotice: {
    id: 'taskDetail.progressDelayNotice',
    defaultMessage:
      '{days, plural, one {This subactivity is # day late} other {This subactivity is # days late}}',
    description:
      'States the engine-derived delay above the cause picker in the progress modal',
  },
  progressDelayReasonLabel: {
    id: 'taskDetail.progressDelayReasonLabel',
    defaultMessage: 'What is holding it up? (optional)',
    description:
      'Label of the delay cause picker shown on the progress report of a late activity',
  },
  progressDelayReasonNone: {
    id: 'taskDetail.progressDelayReasonNone',
    defaultMessage: 'Not stated',
    description:
      'Empty option of the delay cause picker — an honest blank beats a guessed cause',
  },
  progressModalTitle: {
    id: 'taskDetail.progressModalTitle',
    defaultMessage: 'Report progress',
    description: 'Title of the report-progress modal',
  },
  progressModalDescription: {
    id: 'taskDetail.progressModalDescription',
    defaultMessage:
      'Update the progress and status of "{name}". The changes roll up to the main activity and to the project.',
    description: 'Subtitle of the report-progress modal',
  },
  currentStatusLabel: {
    id: 'taskDetail.currentStatusLabel',
    defaultMessage: 'Current status',
    description: 'Label above the current status badge in the progress modal',
  },
  progressUpdateSuccess: {
    id: 'taskDetail.progressUpdateSuccess',
    defaultMessage: 'Progress and status updated',
    description: 'Toast after the subtask progress is reported',
  },
  progressUpdateError: {
    id: 'taskDetail.progressUpdateError',
    defaultMessage: 'Could not update progress',
    description: 'Toast when reporting progress fails',
  },
})
