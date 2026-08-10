/**
 * Pins the expense create/edit form rules. The amount rule has two layers:
 * presence (`amountRequired`) and strict positivity via `parseMoney`
 * (`amountPositive`) — zero is not an expense.
 */

import type { z } from 'zod'

import { expenseCreateSchema, expenseEditSchema } from './expense'

function failures(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input)
  return result.success ? [] : result.error.issues
}

const validCreate = {
  subtaskId: '4f2b8a1c-9d3e-4b6f-8a1c-2e5d7f9b0c3a',
  description: 'Cement bags for slab pour',
  amount: '450.75',
  category: 'materials',
  expenseDate: '2026-07-15',
}

describe('expenseCreateSchema', () => {
  it('accepts a filled expense unchanged', () => {
    expect(expenseCreateSchema.parse(validCreate)).toEqual(validCreate)
  })

  it.each([
    ['description', 'descriptionRequired'],
    ['amount', 'amountRequired'],
    ['category', 'categoryRequired'],
    ['expenseDate', 'dateRequired'],
  ] as const)('rejects an empty %s with its message key', (field, message) => {
    expect(
      failures(expenseCreateSchema, { ...validCreate, [field]: '' }),
    ).toContainEqual(expect.objectContaining({ path: [field], message }))
  })

  it('requires subtaskId to be a string even though it carries no message key', () => {
    const { subtaskId: _dropped, ...withoutSubtask } = validCreate
    expect(failures(expenseCreateSchema, withoutSubtask)).toContainEqual(
      expect.objectContaining({ path: ['subtaskId'] }),
    )
  })

  it.each([
    ['0'],
    ['-450.75'],
    ['not-a-number'], // parseMoney reads garbage as 0, which is not positive
  ])('rejects a non-positive amount %s as amountPositive', (amount) => {
    expect(
      failures(expenseCreateSchema, { ...validCreate, amount }),
    ).toContainEqual(
      expect.objectContaining({ path: ['amount'], message: 'amountPositive' }),
    )
  })

  it('accepts an amount of one cent — the boundary just above zero', () => {
    expect(
      expenseCreateSchema.safeParse({ ...validCreate, amount: '0.01' }).success,
    ).toBe(true)
  })
})

describe('expenseEditSchema', () => {
  const validEdit = {
    description: 'Cement bags for slab pour',
    amount: '450.75',
    category: 'materials',
    expenseDate: '2026-07-15',
  }

  it('accepts a filled edit and takes no subtaskId — the row is already placed', () => {
    expect(expenseEditSchema.parse(validEdit)).toEqual(validEdit)
    expect('subtaskId' in expenseEditSchema.shape).toBe(false)
  })

  it.each([
    ['description', 'descriptionRequired'],
    ['amount', 'amountRequired'],
    ['category', 'categoryRequired'],
    ['expenseDate', 'dateRequired'],
  ] as const)('rejects an empty %s with its message key', (field, message) => {
    expect(
      failures(expenseEditSchema, { ...validEdit, [field]: '' }),
    ).toContainEqual(expect.objectContaining({ path: [field], message }))
  })

  it('rejects a zero amount on edit too', () => {
    expect(
      failures(expenseEditSchema, { ...validEdit, amount: '0' }),
    ).toContainEqual(
      expect.objectContaining({ path: ['amount'], message: 'amountPositive' }),
    )
  })
})
