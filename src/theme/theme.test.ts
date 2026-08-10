import { describe, expect, it } from 'vitest'

import { COLOR_COMPLEMENTARY, COLOR_DESTRUCTIVE } from './colors'
import { system } from './theme'

const role = (token: string) =>
  system.token(token, '') || system.tokens.getVar(token)

describe('lennix theme', () => {
  it('resolves brand + accent to the exact legacy values', () => {
    expect(system.token('colors.brand.800')).toBe('#14213d')
    expect(system.token('colors.accent.500')).toBe('#fca311')
  })

  it('exposes the semantic roles the app relies on', () => {
    const roles = [
      'colors.primary',
      'colors.secondary',
      'colors.accent',
      'colors.complementary',
      'colors.destructive',
      'colors.critical',
      'colors.overBudget',
      'colors.error',
      'colors.success',
      'colors.warning',
      'colors.info',
      'colors.priority.critical',
      'colors.priority.high',
      'colors.priority.medium',
      'colors.priority.low',
      'colors.status.active',
      'colors.status.monitoring',
      'colors.status.contingency',
      'colors.sidebar',
      'colors.ring',
      'colors.bg.card',
      'colors.fg.default',
    ]
    for (const token of roles) {
      expect(role(token), `${token} should be defined`).toBeTruthy()
    }
  })

  it('keeps the four red roles on identical values (split by meaning, not pixel)', () => {
    const original = (token: string) =>
      system.tokens.getByName(`colors.${token}`)?.originalValue
    const destructive = original('destructive')
    expect(destructive).toBeTruthy()
    for (const token of ['critical', 'overBudget', 'error']) {
      expect(original(token), `colors.${token} should match destructive`).toBe(
        destructive,
      )
    }
  })

  it('inherits Chakra default palettes for non-brand colors', () => {
    expect(system.token('colors.gray.500')).toBeTruthy()
    expect(system.token('colors.red.600')).toBeTruthy()
    expect(system.token('colors.green.600')).toBeTruthy()
  })
})

/** Change a token and this test tells you to change `theme/colors.ts` with it. */
describe('literal hex for SVG paint', () => {
  it('matches the tokens it stands in for', () => {
    expect(COLOR_COMPLEMENTARY).toBe(system.token('colors.accent.500'))
    expect(COLOR_DESTRUCTIVE).toBe(system.token('colors.red.600'))
  })
})
