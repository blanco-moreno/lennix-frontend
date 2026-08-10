import { defineMessages } from 'react-intl'

/**
 * Validation message catalog for the budget-approval request schema. The Zod
 * schema stores the catalog **key** as the message; `useZodResolverIntl`
 * looks it up here and translates it at submit time.
 */
export const budgetApprovalValidationMessages = defineMessages({
  amountRequired: {
    id: 'budgetApprovalValidation.amountRequired',
    defaultMessage: 'The amount is required',
    description: 'Budget approval validation: amount field is empty',
  },
  reasonRequired: {
    id: 'budgetApprovalValidation.reasonRequired',
    defaultMessage: 'The reason is required',
    description: 'Budget approval validation: reason field is empty',
  },
})
