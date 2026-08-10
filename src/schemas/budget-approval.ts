import { z } from 'zod'

// Validation messages are the *keys* of budgetApprovalValidationMessages,
// translated by useZodResolverIntl at submit time.
export const budgetApprovalRequestSchema = z.object({
  amount: z.string().min(1, 'amountRequired'),
  reason: z.string().min(1, 'reasonRequired'),
})

export type BudgetApprovalRequestFormValues = z.infer<
  typeof budgetApprovalRequestSchema
>
