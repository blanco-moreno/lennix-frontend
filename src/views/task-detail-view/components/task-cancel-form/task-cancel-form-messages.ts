import { defineMessages } from 'react-intl'

/** Catalog for the task cancel modal — wording only it renders. */
export const taskCancelModalMessages = defineMessages({
  cancelModalDescription: {
    id: 'taskDetail.cancelModalDescription',
    defaultMessage:
      '“{name}” in “{project}” stops counting towards the schedule.',
    description:
      'Subtitle of the cancel-activity modal — names activity and project',
  },
  cancelExplanation: {
    id: 'taskDetail.cancelExplanation',
    defaultMessage:
      'Cancelling sets the progress back to 0%. You can reopen it later.',
    description: 'What cancelling does, shown in the cancel modal',
  },
  reopenModalDescription: {
    id: 'taskDetail.reopenModalDescription',
    defaultMessage:
      '“{name}” in “{project}” counts towards the schedule again.',
    description: 'Subtitle of the reopen modal — names activity and project',
  },
  reopenExplanation: {
    id: 'taskDetail.reopenExplanation',
    defaultMessage:
      'It goes back to pending, at 0%. Report progress to move it forward.',
    description: 'What reopening does, shown in the reopen modal',
  },
  cancelReasonLabel: {
    id: 'taskDetail.cancelReasonLabel',
    defaultMessage: 'Reason (optional)',
    description:
      'Label of the reason Select in the cancel modal. A closed set on the backend, which is why it is not free text',
  },
  cancelReasonNone: {
    id: 'taskDetail.cancelReasonNone',
    defaultMessage: 'Not specified',
    description: 'The empty option of the cancel-reason Select',
  },
})
