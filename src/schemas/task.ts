import { z } from 'zod'

import { parseMoney } from '@/utils'

/**
 * Both dates present and out of order is the only illegal combination — a
 * single date is fine (the backend places the bar on the day it has).
 */
const dueNotBeforeStart = (
  data: { startDate?: string; dueDate?: string },
  ctx: z.RefinementCtx,
) => {
  if (data.startDate && data.dueDate && data.dueDate < data.startDate) {
    ctx.addIssue({
      code: 'custom',
      path: ['dueDate'],
      message: 'dueBeforeStart',
    })
  }
}

// Validation messages are the *keys* of taskValidationMessages;
// useZodResolverIntl translates them into the current locale at submit time.
//
// The phase carries name/description/priority/budget; responsible and location
// describe its first subactivity — a phase has no assignee of its own. Dates are
// deliberately absent: they roll up from the subactivities, never set here.
export const taskCreateSchema = z.object({
  name: z.string().min(1, 'taskNameRequired'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'projectRequired'),
  priority: z.enum(['low', 'medium', 'high']),
  budget: z
    .string()
    .refine((v) => v === '' || parseMoney(v) >= 0, 'budgetNegative'),
  assigneeId: z.string().optional(),
  location: z.string().optional(),
})

export type TaskCreateFormValues = z.infer<typeof taskCreateSchema>

export const taskEditSchema = z.object({
  title: z.string().min(1, 'titleRequired'),
  description: z.string().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  // The phase's responsible.
  assigneeId: z.string(),
  // Only editable by direct budget editors; empty string = leave unset.
  budget: z
    .string()
    .refine((v) => v === '' || parseMoney(v) >= 0, 'budgetNegative'),
})

export type TaskEditFormValues = z.infer<typeof taskEditSchema>

// Dates are ISO `yyyy-MM-dd` from `DateInput`; empty string = unset.
export const subtaskCreateSchema = z
  .object({
    title: z.string().min(1, 'titleRequired'),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    startDate: z.string(),
    dueDate: z.string(),
  })
  .superRefine(dueNotBeforeStart)

export type SubtaskCreateFormValues = z.infer<typeof subtaskCreateSchema>

// Shared by the task and subtask quick-edit modals. Dates are optional at the
// schema level because only the subtask surface has them — phase dates are
// derived from the subactivities on the backend, never edited directly.
export const quickEditSchema = z
  .object({
    title: z.string().trim().min(1, 'titleRequired'),
    assigneeId: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
  })
  .superRefine(dueNotBeforeStart)

export type QuickEditFormValues = z.infer<typeof quickEditSchema>

export const taskBudgetSchema = z.object({
  budget: z.string().min(1, 'budgetRequired'),
})

// The delay reason is a CLOSED vocabulary on the backend (`DelayReason`);
// free text comes back 422. The enum is the contract.
export const DELAY_REASONS = [
  'resource_unavailable',
  'dependency_blocked',
  'scope_change',
  'technical_issues',
  'client_feedback',
  'weather_conditions',
  'material_shortage',
  'budget_constraints',
  'external_approval',
  'other',
] as const

export const taskStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']),
  // Optional: reopening an activity needs no reason.
  delayReason: z.enum(DELAY_REASONS).nullable(),
})

export type TaskStatusFormValues = z.infer<typeof taskStatusSchema>

// One input; `status` is derived from the percentage on both sides, so it is
// not part of the form.
export const subtaskProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
  // A delay is explained where it is observed, and that is here. Nullable
  // because it stays optional even on a late activity: an honest "I do not know
  // yet" beats a picked-at-random cause in the delay analytics.
  delayReason: z.enum(DELAY_REASONS).nullable(),
})

export type SubtaskProgressFormValues = z.infer<typeof subtaskProgressSchema>

// The "progress below minimum" message is parameterized with `minProgress`,
// which useZodResolverIntl cannot inject (it looks up keys without values).
// The caller therefore formats the message with react-intl and passes it in;
// the resolver leaves an already-translated string untouched.
export function buildSubtaskProgressSchema(
  minProgress: number,
  belowMinMessage: string,
) {
  return subtaskProgressSchema.superRefine((data, ctx) => {
    if (data.progress < minProgress) {
      ctx.addIssue({
        code: 'custom',
        path: ['progress'],
        message: belowMinMessage,
      })
    }
  })
}
