import { defineMessages } from 'react-intl'

export const forceStartValidationMessages = defineMessages({
  reasonRequired: {
    id: 'forceStart.validation.reasonRequired',
    defaultMessage: 'Explain why this activity must start while blocked',
    description: 'Error when the force-start reason is empty',
  },
  reasonTooLong: {
    id: 'forceStart.validation.reasonTooLong',
    defaultMessage: 'Keep the justification under 2000 characters',
    description: 'Error when the force-start reason exceeds the backend limit',
  },
})
