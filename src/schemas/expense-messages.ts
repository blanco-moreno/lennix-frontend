import { defineMessages } from 'react-intl'

/**
 * Validation message catalog for the expense schemas. The Zod schemas
 * store the catalog **key** (e.g. `amountRequired`) as the message;
 * `useZodResolverIntl` looks it up here and translates it at submit time.
 */
export const expenseValidationMessages = defineMessages({
  descriptionRequired: {
    id: 'expenseValidation.descriptionRequired',
    defaultMessage: 'The description is required',
    description: 'Expense validation: description field is empty',
  },
  amountRequired: {
    id: 'expenseValidation.amountRequired',
    defaultMessage: 'The amount is required',
    description: 'Expense validation: amount field is empty',
  },
  amountPositive: {
    id: 'expenseValidation.amountPositive',
    defaultMessage: 'The amount must be greater than 0',
    description: 'Expense validation: amount is not positive',
  },
  categoryRequired: {
    id: 'expenseValidation.categoryRequired',
    defaultMessage: 'The category is required',
    description: 'Expense validation: category field is empty',
  },
  dateRequired: {
    id: 'expenseValidation.dateRequired',
    defaultMessage: 'The date is required',
    description: 'Expense validation: date field is empty',
  },
  subtaskRequired: {
    id: 'expenseValidation.subtaskRequired',
    defaultMessage: 'The subtask is required',
    description:
      'Expense validation: subtask is required when imputing to subtask',
  },
})
