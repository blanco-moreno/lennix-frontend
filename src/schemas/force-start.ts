import { z } from 'zod'

/**
 * Mirrors `ForceStartCreateRequest` in `app/force_start_requests/schemas.py`.
 *
 * The reason is mandatory on both sides: overriding a block is a
 * permanent, attributed decision, so it never happens without a written why.
 */
export const forceStartRequestSchema = z.object({
  reason: z.string().trim().min(1, 'reasonRequired').max(2000, 'reasonTooLong'),
})

export type ForceStartRequestFormValues = z.infer<
  typeof forceStartRequestSchema
>
