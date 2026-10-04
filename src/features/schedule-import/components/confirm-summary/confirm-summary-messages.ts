import { defineMessages } from 'react-intl'

export const confirmSummaryMessages = defineMessages({
  activateFailed: {
    id: 'confirmSummary.activateFailed',
    defaultMessage: 'The schedule could not be activated. Nothing was lost.',
    description: 'Inline failure under the summary when go-live fails',
  },
})
