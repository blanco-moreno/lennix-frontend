/**
 * Pins the budget-change request form (B flow): both fields are mandatory —
 * a request without an amount or a written reason has nothing to approve.
 * Messages are the *keys* of `budgetApprovalValidationMessages`.
 */

import type { z } from 'zod'

import { budgetApprovalRequestSchema } from './budget-approval'

function failures(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input)
  return result.success ? [] : result.error.issues
}

describe('budgetApprovalRequestSchema', () => {
  const valid = {
    amount: '125000.00',
    reason: 'Steel price increase on the structural package',
  }

  it('accepts a filled request unchanged', () => {
    expect(budgetApprovalRequestSchema.parse(valid)).toEqual(valid)
  })

  it.each([
    ['amount', 'amountRequired'],
    ['reason', 'reasonRequired'],
  ] as const)('rejects an empty %s with its message key', (field, message) => {
    expect(
      failures(budgetApprovalRequestSchema, { ...valid, [field]: '' }),
    ).toContainEqual(expect.objectContaining({ path: [field], message }))
  })

  it('rejects a non-string amount instead of coercing it', () => {
    expect(
      failures(budgetApprovalRequestSchema, { ...valid, amount: 125000 }),
    ).toContainEqual(expect.objectContaining({ path: ['amount'] }))
  })
})
