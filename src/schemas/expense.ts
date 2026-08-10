import { z } from 'zod'

import { parseMoney } from '@/utils'

// Validation messages are the *keys* of expenseValidationMessages;
// useZodResolverIntl translates them into the current locale at submit time.
export const expenseCreateSchema = z.object({
  subtaskId: z.string(),
  description: z.string().min(1, 'descriptionRequired'),
  amount: z
    .string()
    .min(1, 'amountRequired')
    .refine((v) => parseMoney(v) > 0, 'amountPositive'),
  category: z.string().min(1, 'categoryRequired'),
  expenseDate: z.string().min(1, 'dateRequired'),
})

export type ExpenseCreateFormValues = z.infer<typeof expenseCreateSchema>

export const expenseEditSchema = z.object({
  description: z.string().min(1, 'descriptionRequired'),
  amount: z
    .string()
    .min(1, 'amountRequired')
    .refine((v) => parseMoney(v) > 0, 'amountPositive'),
  category: z.string().min(1, 'categoryRequired'),
  expenseDate: z.string().min(1, 'dateRequired'),
})

export type ExpenseEditFormValues = z.infer<typeof expenseEditSchema>
