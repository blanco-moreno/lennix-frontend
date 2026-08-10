/**
 * Pins the task/subtask form rules:
 * the delay reason is a CLOSED enum (free text comes back 422), and progress is
 * one integer input with `status` derived server-side. Messages are the *keys*
 * of `taskValidationMessages`.
 */

import type { z } from 'zod'

import {
  DELAY_REASONS,
  buildSubtaskProgressSchema,
  quickEditSchema,
  subtaskCreateSchema,
  subtaskProgressSchema,
  taskBudgetSchema,
  taskCreateSchema,
  taskEditSchema,
  taskStatusSchema,
} from './task'

function failures(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input)
  return result.success ? [] : result.error.issues
}

describe('taskCreateSchema', () => {
  const valid = {
    name: 'Obra gruesa',
    description: 'Structural stage for tower A',
    projectId: '4f2b8a1c-9d3e-4b6f-8a1c-2e5d7f9b0c3a',
    priority: 'high',
    budget: '150000',
  }

  it('accepts a filled form unchanged', () => {
    expect(taskCreateSchema.parse(valid)).toEqual(valid)
  })

  it('accepts an omitted description — it is the one optional field', () => {
    const { description: _dropped, ...withoutDescription } = valid
    expect(taskCreateSchema.safeParse(withoutDescription).success).toBe(true)
  })

  it.each([
    ['name', 'taskNameRequired'],
    ['projectId', 'projectRequired'],
  ] as const)('rejects an empty %s with its message key', (field, message) => {
    expect(
      failures(taskCreateSchema, { ...valid, [field]: '' }),
    ).toContainEqual(expect.objectContaining({ path: [field], message }))
  })

  it.each([
    ['an empty string (no budget yet)', ''],
    ['zero', '0'],
    ['a positive amount', '99.50'],
  ])('accepts %s as a budget', (_case, budget) => {
    expect(taskCreateSchema.safeParse({ ...valid, budget }).success).toBe(true)
  })

  it('rejects a negative budget as budgetNegative', () => {
    expect(
      failures(taskCreateSchema, { ...valid, budget: '-1' }),
    ).toContainEqual(
      expect.objectContaining({ path: ['budget'], message: 'budgetNegative' }),
    )
  })

  it('rejects a priority outside low/medium/high', () => {
    expect(
      failures(taskCreateSchema, { ...valid, priority: 'urgent' }),
    ).toContainEqual(expect.objectContaining({ path: ['priority'] }))
  })
})

describe('taskEditSchema', () => {
  const valid = {
    title: 'Obra gruesa',
    description: null,
    priority: 'medium',
    assigneeId: '',
    budget: '',
  }

  it('accepts null description and an empty assigneeId (leave as is)', () => {
    expect(taskEditSchema.parse(valid)).toEqual(valid)
  })

  it('rejects an empty title with the titleRequired key', () => {
    expect(failures(taskEditSchema, { ...valid, title: '' })).toContainEqual(
      expect.objectContaining({ path: ['title'], message: 'titleRequired' }),
    )
  })

  it('rejects an omitted description — nullable is not optional', () => {
    const { description: _dropped, ...withoutDescription } = valid
    expect(failures(taskEditSchema, withoutDescription)).toContainEqual(
      expect.objectContaining({ path: ['description'] }),
    )
  })
})

describe('subtaskCreateSchema', () => {
  const valid = {
    title: 'Pour slab L3',
    description: '',
    priority: 'low',
    startDate: '',
    dueDate: '',
  }

  it('accepts a filled form; description may be empty but not missing', () => {
    expect(subtaskCreateSchema.parse(valid)).toEqual(valid)
    const { description: _dropped, ...withoutDescription } = valid
    expect(failures(subtaskCreateSchema, withoutDescription)).toContainEqual(
      expect.objectContaining({ path: ['description'] }),
    )
  })

  it('rejects an empty title with the titleRequired key', () => {
    expect(
      failures(subtaskCreateSchema, { ...valid, title: '' }),
    ).toContainEqual(
      expect.objectContaining({ path: ['title'], message: 'titleRequired' }),
    )
  })

  it('rejects an end date before the start date, on the dueDate field', () => {
    expect(
      failures(subtaskCreateSchema, {
        ...valid,
        startDate: '2026-08-10',
        dueDate: '2026-08-09',
      }),
    ).toContainEqual(
      expect.objectContaining({
        path: ['dueDate'],
        message: 'dueBeforeStart',
      }),
    )
  })

  it('accepts a single date and a same-day range', () => {
    expect(
      subtaskCreateSchema.safeParse({ ...valid, dueDate: '2026-08-10' })
        .success,
    ).toBe(true)
    expect(
      subtaskCreateSchema.safeParse({
        ...valid,
        startDate: '2026-08-10',
        dueDate: '2026-08-10',
      }).success,
    ).toBe(true)
  })
})

describe('quickEditSchema', () => {
  const valid = {
    title: 'Obra gruesa',
    assigneeId: '',
    priority: 'high',
  }

  it('trims the title before validating it', () => {
    const result = quickEditSchema.safeParse({ ...valid, title: '  Obra  ' })
    expect(result.success).toBe(true)
    expect(result.data?.title).toBe('Obra')
  })

  it('rejects a whitespace-only title as titleRequired', () => {
    expect(
      failures(quickEditSchema, { ...valid, title: '   ' }),
    ).toContainEqual(
      expect.objectContaining({ path: ['title'], message: 'titleRequired' }),
    )
  })

  it.each([['priority', 'urgent']] as const)(
    'rejects a %s outside its closed set',
    (field, value) => {
      expect(
        failures(quickEditSchema, { ...valid, [field]: value }),
      ).toContainEqual(expect.objectContaining({ path: [field] }))
    },
  )
})

describe('taskBudgetSchema', () => {
  it('accepts a non-empty budget string', () => {
    expect(taskBudgetSchema.parse({ budget: '5000' })).toEqual({
      budget: '5000',
    })
  })

  it('rejects an empty budget with the budgetRequired key', () => {
    expect(failures(taskBudgetSchema, { budget: '' })).toContainEqual(
      expect.objectContaining({ path: ['budget'], message: 'budgetRequired' }),
    )
  })
})

describe('taskStatusSchema', () => {
  it('accepts a status change with no reason — reopening needs none', () => {
    expect(
      taskStatusSchema.parse({ status: 'in_progress', delayReason: null }),
    ).toEqual({ status: 'in_progress', delayReason: null })
  })

  it.each(DELAY_REASONS)('accepts the closed-set delay reason %s', (reason) => {
    expect(
      taskStatusSchema.safeParse({ status: 'cancelled', delayReason: reason })
        .success,
    ).toBe(true)
  })

  it('rejects free-text delay reasons instead of letting the backend 422', () => {
    expect(
      failures(taskStatusSchema, {
        status: 'cancelled',
        delayReason: 'it rained a lot',
      }),
    ).toContainEqual(expect.objectContaining({ path: ['delayReason'] }))
  })

  it('rejects an omitted delayReason — nullable is not optional', () => {
    expect(failures(taskStatusSchema, { status: 'done' })).toContainEqual(
      expect.objectContaining({ path: ['delayReason'] }),
    )
  })
})

describe('subtaskProgressSchema', () => {
  it.each([0, 50, 100])(
    'accepts %i%% — one integer input, no status field',
    (progress) => {
      expect(
        subtaskProgressSchema.safeParse({ progress, delayReason: null })
          .success,
      ).toBe(true)
    },
  )

  it.each([
    ['below zero', -1],
    ['above one hundred', 101],
    ['fractional', 50.5],
  ])('rejects a progress that is %s', (_case, progress) => {
    expect(
      failures(subtaskProgressSchema, { progress, delayReason: null }),
    ).toContainEqual(expect.objectContaining({ path: ['progress'] }))
  })

  it('rejects a string percentage instead of coercing it', () => {
    expect(
      failures(subtaskProgressSchema, { progress: '50', delayReason: null }),
    ).toContainEqual(expect.objectContaining({ path: ['progress'] }))
  })

  it('keeps the delay reason optional even on a late activity', () => {
    expect(
      subtaskProgressSchema.safeParse({
        progress: 10,
        delayReason: 'weather_conditions',
      }).success,
    ).toBe(true)
    expect(
      subtaskProgressSchema.safeParse({ progress: 10, delayReason: null })
        .success,
    ).toBe(true)
  })
})

describe('buildSubtaskProgressSchema', () => {
  const schema = buildSubtaskProgressSchema(
    40,
    'Progress cannot drop below 40%',
  )

  it('rejects progress below the current minimum with the pre-translated message', () => {
    expect(
      failures(schema, { progress: 39, delayReason: null }),
    ).toContainEqual(
      expect.objectContaining({
        path: ['progress'],
        message: 'Progress cannot drop below 40%',
      }),
    )
  })

  it('accepts progress exactly at the minimum — no going back, staying put is fine', () => {
    expect(schema.safeParse({ progress: 40, delayReason: null }).success).toBe(
      true,
    )
  })

  it('still enforces the base 0–100 integer rules', () => {
    expect(
      failures(schema, { progress: 105, delayReason: null }),
    ).toContainEqual(expect.objectContaining({ path: ['progress'] }))
  })
})
