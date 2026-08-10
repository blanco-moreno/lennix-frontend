/**
 * Pins the login and password-reset form rules. Messages are asserted as the
 * *keys* of `authValidationMessages` — `useZodResolverIntl` translates them at
 * submit time, so a renamed key here is a broken translation in the product.
 */

import type { z } from 'zod'

import { loginSchema, passwordResetSchema } from './auth'

function failures(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input)
  return result.success ? [] : result.error.issues
}

describe('loginSchema', () => {
  const valid = {
    email: 'ana@constructora.cl',
    password: 'hunter2!',
    rememberMe: false,
  }

  it('accepts a filled login form unchanged', () => {
    expect(loginSchema.parse(valid)).toEqual(valid)
  })

  it('does not force an email format — the backend owns that check', () => {
    // Any non-empty string passes: the rule is min(1), not .email().
    expect(loginSchema.safeParse({ ...valid, email: 'ana' }).success).toBe(true)
  })

  it.each([
    ['email', 'emailRequired'],
    ['password', 'passwordRequired'],
  ] as const)('rejects an empty %s with its message key', (field, message) => {
    expect(failures(loginSchema, { ...valid, [field]: '' })).toContainEqual(
      expect.objectContaining({ path: [field], message }),
    )
  })

  it('requires rememberMe to be a real boolean, not a missing field', () => {
    const { rememberMe: _dropped, ...withoutRemember } = valid
    expect(failures(loginSchema, withoutRemember)).toContainEqual(
      expect.objectContaining({ path: ['rememberMe'] }),
    )
  })
})

describe('passwordResetSchema', () => {
  it('accepts a non-empty password', () => {
    expect(passwordResetSchema.parse({ password: 'new-secret-9' })).toEqual({
      password: 'new-secret-9',
    })
  })

  it('rejects an empty password with the passwordRequired key', () => {
    expect(failures(passwordResetSchema, { password: '' })).toContainEqual(
      expect.objectContaining({
        path: ['password'],
        message: 'passwordRequired',
      }),
    )
  })
})
