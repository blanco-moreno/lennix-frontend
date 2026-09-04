import { z } from 'zod'

import { parseMoney } from '@/utils'

// Validation messages are the *keys* of expenseValidationMessages;
// useZodResolverIntl translates them into the current locale at submit time.
export const expenseCreateSchema = z
  .object({
    imputationType: z.enum(['subtask', 'project']).default('subtask'),
    subtaskId: z.string().optional(),
    projectId: z.string().optional(),
    description: z.string().min(1, 'descriptionRequired'),
    amount: z
      .string()
      .min(1, 'amountRequired')
      .refine((v) => parseMoney(v) > 0, 'amountPositive'),
    category: z.string().min(1, 'categoryRequired'),
    expenseDate: z.string().min(1, 'dateRequired'),
    documentType: z
      .enum(['invoice', 'receipt', 'purchase_order', ''])
      .optional()
      .nullable(),
    documentNumber: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.imputationType === 'subtask') {
        return !!data.subtaskId && data.subtaskId.trim().length > 0
      }
      return true
    },
    {
      message: 'subtaskRequired',
      path: ['subtaskId'],
    },
  )

export type ExpenseCreateFormValues = z.infer<typeof expenseCreateSchema>

export const expenseEditSchema = z.object({
  description: z.string().min(1, 'descriptionRequired'),
  amount: z
    .string()
    .min(1, 'amountRequired')
    .refine((v) => parseMoney(v) > 0, 'amountPositive'),
  category: z.string().min(1, 'categoryRequired'),
  expenseDate: z.string().min(1, 'dateRequired'),
  documentType: z
    .enum(['invoice', 'receipt', 'purchase_order', ''])
    .optional()
    .nullable(),
  documentNumber: z.string().optional().nullable(),
})

export type ExpenseEditFormValues = z.infer<typeof expenseEditSchema>
