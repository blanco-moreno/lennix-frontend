import { defineMessages } from 'react-intl'

/**
 * Validation message catalog for the team-member create schema. The Zod
 * schema stores the catalog **key** as the message; `useZodResolverIntl`
 * looks it up here and translates it at submit time.
 */
export const teamMemberValidationMessages = defineMessages({
  firstNameRequired: {
    id: 'teamMemberValidation.firstNameRequired',
    defaultMessage: 'The first name is required',
    description: 'Team member validation: first name field is empty',
  },
  lastNameRequired: {
    id: 'teamMemberValidation.lastNameRequired',
    defaultMessage: 'The last name is required',
    description: 'Team member validation: last name field is empty',
  },
  emailInvalid: {
    id: 'teamMemberValidation.emailInvalid',
    defaultMessage: 'Enter a valid email address',
    description: 'Team member validation: email is empty or malformed',
  },
})
