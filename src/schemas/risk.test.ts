/**
 * Pins the risk register form: probability and impact are the two 3×3
 * axes and always required; the response strategy allows '' as "not decided
 * yet" because the backend column is nullable. Messages are the *keys* of
 * `riskValidationMessages`.
 */

import { riskFormSchema } from './risk'

const validRisk = {
  title: 'Crane availability during facade stage',
  description: 'Only one tower crane serves both frentes.',
  category: 'logistics',
  probability: 'medium',
  impact: 'high',
  responseStrategy: 'mitigate',
  mitigation: 'Book the second crane two weeks ahead.',
  status: 'open',
}

function failures(input: unknown) {
  const result = riskFormSchema.safeParse(input)
  return result.success ? [] : result.error.issues
}

describe('riskFormSchema', () => {
  it('accepts a fully filled risk unchanged', () => {
    expect(riskFormSchema.parse(validRisk)).toEqual(validRisk)
  })

  it('trims the title before validating it', () => {
    const result = riskFormSchema.safeParse({
      ...validRisk,
      title: '  Crane clash  ',
    })
    expect(result.success).toBe(true)
    expect(result.data?.title).toBe('Crane clash')
  })

  it('rejects a whitespace-only title as titleRequired', () => {
    expect(failures({ ...validRisk, title: '   ' })).toContainEqual(
      expect.objectContaining({ path: ['title'], message: 'titleRequired' }),
    )
  })

  it.each([
    ['title', 256, 'titleTooLong'],
    ['description', 4001, 'descriptionTooLong'],
    ['category', 101, 'categoryTooLong'],
    ['mitigation', 4001, 'mitigationTooLong'],
  ] as const)(
    'rejects a %s of %i characters as %s',
    (field, length, message) => {
      expect(
        failures({ ...validRisk, [field]: 'x'.repeat(length) }),
      ).toContainEqual(expect.objectContaining({ path: [field], message }))
    },
  )

  it('accepts each capped field at exactly its cap', () => {
    expect(
      riskFormSchema.safeParse({
        ...validRisk,
        title: 'x'.repeat(255),
        description: 'x'.repeat(4000),
        category: 'x'.repeat(100),
        mitigation: 'x'.repeat(4000),
      }).success,
    ).toBe(true)
  })

  it('allows empty description, category and mitigation — only the cell is mandatory', () => {
    expect(
      riskFormSchema.safeParse({
        ...validRisk,
        description: '',
        category: '',
        mitigation: '',
      }).success,
    ).toBe(true)
  })

  it.each(['probability', 'impact'] as const)(
    'restricts %s to the three matrix levels',
    (axis) => {
      for (const level of ['low', 'medium', 'high']) {
        expect(
          riskFormSchema.safeParse({ ...validRisk, [axis]: level }).success,
        ).toBe(true)
      }
      expect(failures({ ...validRisk, [axis]: 'critical' })).toContainEqual(
        expect.objectContaining({ path: [axis] }),
      )
    },
  )

  it.each(['', 'avoid', 'mitigate', 'transfer', 'accept'])(
    'accepts the response strategy %j — empty is "not decided yet"',
    (responseStrategy) => {
      expect(
        riskFormSchema.safeParse({ ...validRisk, responseStrategy }).success,
      ).toBe(true)
    },
  )

  it('rejects a response strategy outside the closed set', () => {
    expect(
      failures({ ...validRisk, responseStrategy: 'ignore' }),
    ).toContainEqual(expect.objectContaining({ path: ['responseStrategy'] }))
  })

  it.each(['open', 'mitigating', 'closed'])(
    'accepts the %s status',
    (status) => {
      expect(riskFormSchema.safeParse({ ...validRisk, status }).success).toBe(
        true,
      )
    },
  )

  it('rejects a status outside the closed set', () => {
    expect(failures({ ...validRisk, status: 'resolved' })).toContainEqual(
      expect.objectContaining({ path: ['status'] }),
    )
  })
})
