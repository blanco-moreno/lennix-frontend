/**
 * Pins the force-start request rule: overriding a block is a
 * permanent, attributed decision, so the reason is mandatory, trimmed, and
 * capped at the backend's 2000 characters.
 */

import { forceStartRequestSchema } from './force-start'

describe('forceStartRequestSchema', () => {
  it('accepts a written reason and trims the surrounding whitespace', () => {
    expect(
      forceStartRequestSchema.parse({
        reason: '  Concrete supplier confirmed early delivery  ',
      }),
    ).toEqual({ reason: 'Concrete supplier confirmed early delivery' })
  })

  it.each([
    ['an empty string', ''],
    ['whitespace only', '   \n\t '],
  ])(
    'rejects %s as reasonRequired — trim runs before the check',
    (_case, reason) => {
      const result = forceStartRequestSchema.safeParse({ reason })
      expect(result.success).toBe(false)
      expect(result.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ['reason'],
          message: 'reasonRequired',
        }),
      )
    },
  )

  it('accepts exactly 2000 characters — the backend cap, inclusive', () => {
    expect(
      forceStartRequestSchema.safeParse({ reason: 'x'.repeat(2000) }).success,
    ).toBe(true)
  })

  it('rejects 2001 characters as reasonTooLong', () => {
    const result = forceStartRequestSchema.safeParse({
      reason: 'x'.repeat(2001),
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({ path: ['reason'], message: 'reasonTooLong' }),
    )
  })
})
