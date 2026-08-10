/**
 * Pins the organization-create form: name and slug are both mandatory.
 * Messages are the *keys* of `orgValidationMessages`.
 */

import type { z } from 'zod'

import { orgCreateSchema } from './organization'

function failures(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input)
  return result.success ? [] : result.error.issues
}

describe('orgCreateSchema', () => {
  const valid = { name: 'Constructora Andina', slug: 'constructora-andina' }

  it('accepts a filled form unchanged', () => {
    expect(orgCreateSchema.parse(valid)).toEqual(valid)
  })

  it.each([
    ['name', 'nameRequired'],
    ['slug', 'slugRequired'],
  ] as const)('rejects an empty %s with its message key', (field, message) => {
    expect(failures(orgCreateSchema, { ...valid, [field]: '' })).toContainEqual(
      expect.objectContaining({ path: [field], message }),
    )
  })

  it('rejects a missing slug rather than defaulting one', () => {
    expect(
      failures(orgCreateSchema, { name: 'Constructora Andina' }),
    ).toContainEqual(expect.objectContaining({ path: ['slug'] }))
  })
})
