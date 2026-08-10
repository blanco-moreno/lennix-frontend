import { defineMessages } from 'react-intl'

export const parentAutoCompleteMessages = defineMessages({
  parentAutoCompleted: {
    id: 'parentAutoComplete.parentAutoCompleted',
    defaultMessage:
      '“{title}” completed on its own — every subactivity under it is done.',
    description:
      'Toast when the backend auto-completes a main activity because all its subactivities reached done',
  },
})
