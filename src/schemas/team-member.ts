import { z } from 'zod'

// Validation messages are the *keys* of teamMemberValidationMessages,
// translated by useZodResolverIntl at submit time.
//
// `role` is the **organization** role (`organization_member.role`). The global
// role is never collected here: the backend assigns it server-side.
export const teamMemberCreateSchema = z.object({
  firstName: z.string().trim().min(1, 'firstNameRequired'),
  lastName: z.string().trim().min(1, 'lastNameRequired'),
  email: z.string().trim().email('emailInvalid'),
  role: z.enum(['member', 'admin']),
})

export type TeamMemberCreateFormValues = z.infer<typeof teamMemberCreateSchema>
