import { defineMessages } from 'react-intl'

/**
 * Validation message catalog for the project schemas. The Zod schemas
 * store the catalog **key** (e.g. `nameRequired`) as the message;
 * `useZodResolverIntl` looks it up here and translates it at submit time.
 */
export const projectValidationMessages = defineMessages({
  nameRequired: {
    id: 'projectValidation.nameRequired',
    defaultMessage: 'The project name is required',
    description: 'Project edit validation: name field is empty',
  },
  budgetRequired: {
    id: 'projectValidation.budgetRequired',
    defaultMessage: 'The budget is required',
    description: 'Project budget validation: budget field is empty',
  },
  userRequired: {
    id: 'projectValidation.userRequired',
    defaultMessage: 'You must select a member',
    description: 'Assign member validation: no user selected',
  },
})
