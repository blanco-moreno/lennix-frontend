import { defineMessages } from 'react-intl'

/**
 * Validation message catalog for the organization schemas. The Zod schemas
 * store the catalog **key** (e.g. `nameRequired`) as the message;
 * `useZodResolverIntl` looks it up here and translates it at submit time.
 */
export const orgValidationMessages = defineMessages({
  nameRequired: {
    id: 'orgValidation.nameRequired',
    defaultMessage: 'The name is required',
    description: 'Organization create validation: name field is empty',
  },
  slugRequired: {
    id: 'orgValidation.slugRequired',
    defaultMessage: 'The slug is required',
    description: 'Organization create validation: slug field is empty',
  },
})
