import { z } from 'zod'

/**
 * Mirrors `RiskCreateRequest` / `RiskUpdateRequest` in `app/risks/schemas.py`.
 * Probability and impact are the two 3×3 axes and are always required —
 * a risk without a cell has nowhere to sit on the matrix.
 *
 * Validation messages are the *keys* of `riskValidationMessages`, translated by
 * `useZodResolverIntl` at submit time.
 */
const riskLevel = z.enum(['low', 'medium', 'high'])

export const riskFormSchema = z.object({
  title: z.string().trim().min(1, 'titleRequired').max(255, 'titleTooLong'),
  description: z.string().max(4000, 'descriptionTooLong'),
  category: z.string().max(100, 'categoryTooLong'),
  probability: riskLevel,
  impact: riskLevel,
  // '' is the "not decided yet" option — the backend column is nullable.
  responseStrategy: z.enum(['', 'avoid', 'mitigate', 'transfer', 'accept']),
  mitigation: z.string().max(4000, 'mitigationTooLong'),
  status: z.enum(['open', 'mitigating', 'closed']),
})

export type RiskFormValues = z.infer<typeof riskFormSchema>
