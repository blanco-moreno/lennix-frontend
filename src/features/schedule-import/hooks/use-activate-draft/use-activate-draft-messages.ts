import { defineMessages } from 'react-intl'

export const useActivateDraftMessages = defineMessages({
  activatedToast: {
    id: 'activateSchedule.activatedToast',
    defaultMessage: 'Your project is live. Lennix is tracking it from here.',
    description:
      'Success toast at the moment of highest product value — go-live',
  },
  quotaToast: {
    id: 'activateSchedule.quotaToast',
    defaultMessage:
      'Go-live blocked: your plan allows {limit} live projects and you have {current}.',
    description:
      'Error toast when go-live is refused by the plan quota — the Activate button sits in the sticky nav, far from the inline notice',
  },
  failedToast: {
    id: 'activateSchedule.failedToast',
    defaultMessage: 'Go-live failed. Your draft is safe — try again.',
    description: 'Error toast when go-live fails for any other reason',
  },
})
