import { z } from 'zod'

// Validation messages are the *keys* of projectValidationMessages, translated
// by useZodResolverIntl at submit time.
export const projectEditSchema = z.object({
  name: z.string().min(1, 'nameRequired'),
  description: z.string().nullable(),
  location: z.string().nullable(),
  // Leadership is a project attribute (`Project.manager_id`), so it is edited
  // here rather than on the Team tab. Empty means "leave it as it is" — the
  // API has no way to clear a manager.
  managerId: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  // Empty budget means "leave it as it is"; the drawer only submits a change
  // when the value differs from the current budget.
  budget: z.string(),
  // ISO 4217 (`BUD-10`). Sent only when it moved; a relabel, never a conversion.
  currency: z.enum(['CLP', 'USD']),
  // Required only when the role edits budget via approval request — the
  // drawer enforces that contextually, not the schema.
  budgetReason: z.string(),
})

export type ProjectEditFormValues = z.infer<typeof projectEditSchema>

export const projectPrioritySchema = z.object({
  priority: z.enum(['low', 'medium', 'high']),
})

export type ProjectPriorityFormValues = z.infer<typeof projectPrioritySchema>

export const projectBudgetSchema = z.object({
  budget: z.string().min(1, 'budgetRequired'),
})

// Project membership is membership, nothing more: the API
// takes a user id and nothing else, so the form has one field.
export const assignMemberSchema = z.object({
  userId: z.string().min(1, 'userRequired'),
})

export type AssignMemberFormValues = z.infer<typeof assignMemberSchema>
