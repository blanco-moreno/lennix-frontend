import { defineMessages } from 'react-intl'

/**
 * Validation message catalog for the auth schemas. The Zod schemas store the
 * catalog **key** (e.g. `emailRequired`) as the message; `useZodResolverIntl`
 * looks it up here at submit time.
 */
export const authValidationMessages = defineMessages({
  emailRequired: {
    id: 'authValidation.emailRequired',
    defaultMessage: 'Username/email is required',
    description: 'Login form validation: email field is empty',
  },
  passwordRequired: {
    id: 'authValidation.passwordRequired',
    defaultMessage: 'Password is required',
    description: 'Login form validation: password field is empty',
  },
})
