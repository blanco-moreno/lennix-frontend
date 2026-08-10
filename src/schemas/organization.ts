import { z } from 'zod'

// Validation messages are the *keys* of orgValidationMessages, translated
// by useZodResolverIntl at submit time.
export const orgCreateSchema = z.object({
  name: z.string().min(1, 'nameRequired'),
  slug: z.string().min(1, 'slugRequired'),
})

export type OrgCreateFormValues = z.infer<typeof orgCreateSchema>
