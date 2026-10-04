import { defineMessages } from 'react-intl'

export const progressPickerMessages = defineMessages({
  label: {
    id: 'progressPicker.label',
    defaultMessage: 'Progress',
    description: 'Label of the progress slider',
  },
  minWarning: {
    id: 'progressPicker.minWarning',
    defaultMessage:
      'Minimum allowed progress is {minProgress}% (last reported value). To lower it, switch the status to Cancelled.',
    description: 'Warning shown when the picker refuses values under its floor',
  },
})
