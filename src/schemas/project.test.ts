/**
 * Pins the four project forms: edit, priority, budget, and member assignment.
 * Messages are the *keys* of `projectValidationMessages`.
 */

import type { z } from 'zod'

import {
  assignMemberSchema,
  projectBudgetSchema,
  projectEditSchema,
  projectPrioritySchema,
} from './project'

function failures(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input)
  return result.success ? [] : result.error.issues
}

describe('projectEditSchema', () => {
  const valid = {
    name: 'Edificio Los Aromos',
    description: 'Twelve-storey residential tower',
    location: 'Providencia, Santiago',
    managerId: '4f2b8a1c-9d3e-4b6f-8a1c-2e5d7f9b0c3a',
    priority: 'medium',
    budget: '850000',
    currency: 'CLP',
    budgetReason: '',
  }

  it('accepts a filled form unchanged', () => {
    expect(projectEditSchema.parse(valid)).toEqual(valid)
  })

  it('accepts null description and location — both columns are nullable', () => {
    expect(
      projectEditSchema.safeParse({
        ...valid,
        description: null,
        location: null,
      }).success,
    ).toBe(true)
  })

  it('rejects an omitted description — nullable is not optional', () => {
    const { description: _dropped, ...withoutDescription } = valid
    expect(failures(projectEditSchema, withoutDescription)).toContainEqual(
      expect.objectContaining({ path: ['description'] }),
    )
  })

  it('rejects an empty name with the nameRequired key', () => {
    expect(failures(projectEditSchema, { ...valid, name: '' })).toContainEqual(
      expect.objectContaining({ path: ['name'], message: 'nameRequired' }),
    )
  })

  it('accepts an empty managerId — empty means "leave the manager as it is"', () => {
    expect(
      projectEditSchema.safeParse({ ...valid, managerId: '' }).success,
    ).toBe(true)
  })

  it('takes only a currency a project is kept in (BUD-10)', () => {
    expect(
      failures(projectEditSchema, { ...valid, currency: 'CLF' }),
    ).not.toEqual([])
    expect(failures(projectEditSchema, { ...valid, currency: 'USD' })).toEqual(
      [],
    )
  })
})

describe('projectPrioritySchema', () => {
  it.each(['low', 'medium', 'high'] as const)(
    'accepts the %s priority',
    (priority) => {
      expect(projectPrioritySchema.parse({ priority })).toEqual({ priority })
    },
  )

  it('rejects a priority outside the closed set', () => {
    expect(
      failures(projectPrioritySchema, { priority: 'urgent' }),
    ).toContainEqual(expect.objectContaining({ path: ['priority'] }))
  })
})

describe('projectBudgetSchema', () => {
  it('accepts a non-empty budget string', () => {
    expect(projectBudgetSchema.parse({ budget: '2500000.00' })).toEqual({
      budget: '2500000.00',
    })
  })

  it('rejects an empty budget with the budgetRequired key', () => {
    expect(failures(projectBudgetSchema, { budget: '' })).toContainEqual(
      expect.objectContaining({ path: ['budget'], message: 'budgetRequired' }),
    )
  })
})

describe('assignMemberSchema', () => {
  it('accepts a user id — membership is membership, nothing more', () => {
    expect(
      assignMemberSchema.parse({
        userId: '4f2b8a1c-9d3e-4b6f-8a1c-2e5d7f9b0c3a',
      }),
    ).toEqual({ userId: '4f2b8a1c-9d3e-4b6f-8a1c-2e5d7f9b0c3a' })
  })

  it('rejects an empty selection with the userRequired key', () => {
    expect(failures(assignMemberSchema, { userId: '' })).toContainEqual(
      expect.objectContaining({ path: ['userId'], message: 'userRequired' }),
    )
  })
})
