import { z } from 'zod'

// Login validation: message is the *key* of authValidationMessages.
// useZodResolverIntl translates the key into the current locale at
// submit time.
export const loginSchema = z.object({
  email: z.string().min(1, 'emailRequired'),
  password: z.string().min(1, 'passwordRequired'),
  rememberMe: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// `passwordRequired` is the *key* of authValidationMessages, translated by
// useZodResolverIntl at submit time (same convention as loginSchema).
export const passwordResetSchema = z.object({
  password: z.string().min(1, 'passwordRequired'),
})

export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>
