import { defineMessages } from 'react-intl'

export const riskValidationMessages = defineMessages({
  titleRequired: {
    id: 'risk.validation.titleRequired',
    defaultMessage: 'Describe the risk in one line',
    description: 'Error when the risk title is empty',
  },
  titleTooLong: {
    id: 'risk.validation.titleTooLong',
    defaultMessage: 'Keep the title under 255 characters',
    description: 'Error when the risk title exceeds the backend limit',
  },
  descriptionTooLong: {
    id: 'risk.validation.descriptionTooLong',
    defaultMessage: 'Keep the description under 4000 characters',
    description: 'Error when the risk description exceeds the backend limit',
  },
  categoryTooLong: {
    id: 'risk.validation.categoryTooLong',
    defaultMessage: 'Keep the category under 100 characters',
    description: 'Error when the risk category exceeds the backend limit',
  },
  mitigationTooLong: {
    id: 'risk.validation.mitigationTooLong',
    defaultMessage: 'Keep the mitigation plan under 4000 characters',
    description: 'Error when the risk mitigation exceeds the backend limit',
  },
})
