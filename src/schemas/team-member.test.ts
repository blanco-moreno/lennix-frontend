/**
 * Pins the invite-member form. `role` is the ORGANIZATION role only — the
 * global role is assigned server-side (SEC-1), so nothing here may widen the
 * enum past member/admin. Messages are the *keys* of
 * `teamMemberValidationMessages`.
 */

import { teamMemberCreateSchema } from './team-member'

function failures(input: unknown) {
  const result = teamMemberCreateSchema.safeParse(input)
  return result.success ? [] : result.error.issues
}

describe('teamMemberCreateSchema', () => {
  const valid = {
    firstName: 'Ana',
    lastName: 'Riquelme',
    email: 'ana.riquelme@constructora.cl',
    role: 'member',
  }

  it('accepts a filled invite unchanged', () => {
    expect(teamMemberCreateSchema.parse(valid)).toEqual(valid)
  })

  it('trims names and email before validating', () => {
    expect(
      teamMemberCreateSchema.parse({
        ...valid,
        firstName: '  Ana ',
        lastName: ' Riquelme  ',
        email: ' ana.riquelme@constructora.cl ',
      }),
    ).toEqual(valid)
  })

  it.each([
    ['firstName', 'firstNameRequired'],
    ['lastName', 'lastNameRequired'],
  ] as const)(
    'rejects a whitespace-only %s with its message key',
    (field, message) => {
      expect(failures({ ...valid, [field]: '   ' })).toContainEqual(
        expect.objectContaining({ path: [field], message }),
      )
    },
  )

  it.each(['', 'ana', 'ana@', '@constructora.cl', 'ana@constructora'])(
    'rejects the malformed email %j as emailInvalid',
    (email) => {
      expect(failures({ ...valid, email })).toContainEqual(
        expect.objectContaining({ path: ['email'], message: 'emailInvalid' }),
      )
    },
  )

  it.each(['member', 'admin'] as const)(
    'accepts the organization role %s',
    (role) => {
      expect(teamMemberCreateSchema.safeParse({ ...valid, role }).success).toBe(
        true,
      )
    },
  )

  it('rejects any role outside member/admin — the global role is never collected here', () => {
    expect(failures({ ...valid, role: 'owner' })).toContainEqual(
      expect.objectContaining({ path: ['role'] }),
    )
  })
})
