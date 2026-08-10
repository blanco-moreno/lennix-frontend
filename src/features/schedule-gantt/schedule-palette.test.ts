/**
 * The chart's colours are CSS variable references to the `gantt.*` semantic
 * tokens — this seam can fail silently (a hand-written variable name paints
 * the bars black). Each reference is pinned to a token that actually exists,
 * and the LIGHT-mode values are pinned to the palette entries they stand in
 * for, so a token change tells you to re-check the chart.
 */

import { system } from '@/theme/theme'

import {
  BAR_SUBTASK,
  BAR_CRITICAL,
  BAR_DELAY,
  BAR_TASK,
  BAR_SELECTED_STROKE,
  BLOCKED_STROKE,
  EDGE_BROKEN,
  PROGRESS_MARK,
  ROW_SELECTED,
  rowBackground,
  TODAY_LINE,
  WEEKEND_BAND,
} from './schedule-palette'

/** The token path a `var(--lennix-colors-gantt-*)` reference points at. */
function tokenPathOf(cssVar: string): string {
  const name = /^var\(--lennix-colors-(.+)\)$/.exec(cssVar)?.[1]
  expect(name, `${cssVar} is not a lennix color var`).toBeDefined()
  return `colors.${name!.replace('gantt-', 'gantt.')}`
}

/**
 * The resolved LIGHT value behind a palette export.
 *
 * A semantic token resolves to its own CSS variable, so the light value has
 * to be read from the token's `base` condition and dereferenced one more hop
 * (`{colors.brand.600}` → `#24395e`). Looking it up by name is also what
 * proves the token exists at all: a typo'd variable name would paint the
 * bars black in the browser and pass a naive string comparison here.
 */
function baseValue(cssVar: string): string {
  const path = tokenPathOf(cssVar)
  const token = system.tokens.getByName(path)
  expect(token, `${path} is not a token`).toBeDefined()
  const base = (
    token!.extensions as { conditions?: Record<string, string> } | undefined
  )?.conditions?.base
  const raw = base ?? (token!.originalValue as string)
  const reference = /^\{(.+)\}$/.exec(raw)?.[1]
  return reference ? system.token(reference) : raw
}

describe('schedule palette', () => {
  it('references only tokens that exist, with the light values pinned', () => {
    expect(baseValue(BAR_TASK)).toBe(system.token('colors.brand.600'))
    expect(baseValue(BAR_SUBTASK)).toBe(system.token('colors.brand.400'))
    expect(baseValue(BAR_CRITICAL)).toBe(system.token('colors.red.600'))
    expect(baseValue(BAR_DELAY)).toBe(system.token('colors.red.600'))
    expect(baseValue(EDGE_BROKEN)).toBe(system.token('colors.red.600'))
    expect(baseValue(BLOCKED_STROKE)).toBe(system.token('colors.brand.700'))
    expect(baseValue(BAR_SELECTED_STROKE)).toBe(
      system.token('colors.brand.800'),
    )
    expect(baseValue(PROGRESS_MARK)).toBe('#ffffff')
    expect(baseValue(ROW_SELECTED)).toBe(system.token('colors.brand.100'))
    expect(baseValue(WEEKEND_BAND)).toBe(system.token('colors.gray.100'))
    expect(baseValue(TODAY_LINE)).toBe(system.token('colors.gray.700'))
  })

  it('keeps today and the weekend out of the hues that carry meaning', () => {
    // Both are context. Borrowing red would say "critical", amber would say
    // "link" — a reference line must not look like something the schedule
    // is reporting.
    for (const contextual of [TODAY_LINE, WEEKEND_BAND]) {
      expect(baseValue(contextual)).not.toBe(baseValue(BAR_CRITICAL))
      expect(baseValue(contextual)).not.toBe(system.token('colors.accent.500'))
    }
    // And the weekend must not read as a row under the pointer.
    expect(baseValue(WEEKEND_BAND)).not.toBe(baseValue(ROW_SELECTED))
  })

  it('keeps the selected outline separable from blocked and from its own band', () => {
    expect(baseValue(BAR_SELECTED_STROKE)).not.toBe(baseValue(BLOCKED_STROKE))
    expect(baseValue(BAR_SELECTED_STROKE)).not.toBe(baseValue(ROW_SELECTED))
  })

  it('never paints a healthy bar the product warning colour', () => {
    expect(baseValue(BAR_SUBTASK)).not.toBe(system.token('colors.accent.500'))
    expect(baseValue(BAR_TASK)).not.toBe(system.token('colors.accent.500'))
  })

  it('separates the two levels by colour, not only by indent', () => {
    expect(baseValue(BAR_TASK)).not.toBe(baseValue(BAR_SUBTASK))
  })

  it('paints slipped time the same red as the critical path, and says why', () => {
    // Deliberate after the colorimetry pass: on a bar chart, lost days and the
    // critical path are the same order of urgency, and the row's mark already
    // tells the two apart in a way colour alone never did. What must stay
    // distinct is delay from the BRAND amber, which now means only action.
    expect(baseValue(BAR_DELAY)).toBe(baseValue(BAR_CRITICAL))
    expect(baseValue(BAR_DELAY)).not.toBe(system.token('colors.accent.500'))
  })
})

describe('row background', () => {
  const state = (over: Partial<Parameters<typeof rowBackground>[0]> = {}) =>
    rowBackground({
      selected: false,
      hovered: false,
      ...over,
    })

  it('leaves a resting row alone, with no band and no outline on the chart', () => {
    expect(state()).toEqual({ bg: 'transparent', band: null, outline: null })
  })

  it('lights a hovered row without claiming it is selected', () => {
    const hovered = state({ hovered: true })
    expect(hovered.bg).toBe('gantt.row-hovered')
    expect(hovered.band).not.toBeNull()
    expect(hovered.band).not.toBe(state({ selected: true }).band)
  })

  it('never lets hover wash a selected row out', () => {
    // The defect: hover replaced the selected background, so a selected row
    // stopped looking selected exactly while the pointer was on it. Hover has
    // to stay in the same family and go deeper, not lighter.
    expect(state({ selected: true }).bg).toBe('gantt.row-selected')
    expect(state({ selected: true, hovered: true }).bg).toBe(
      'gantt.row-selected-hover',
    )
    expect(state({ selected: true, hovered: true }).bg).not.toBe(
      state({ hovered: true }).bg,
    )
  })

  it('keeps a selected row banded whether or not the pointer is on it', () => {
    expect(state({ selected: true }).band).toBe(
      state({ selected: true, hovered: true }).band,
    )
  })

  it('outlines the bar of a selected row, and of no other row', () => {
    expect(state({ selected: true }).outline).toBe(BAR_SELECTED_STROKE)
    expect(state().outline).toBeNull()
    expect(state({ hovered: true }).outline).toBeNull()
  })

  it('keeps a selected bar outlined whether or not the pointer is on it', () => {
    expect(state({ selected: true, hovered: true }).outline).toBe(
      state({ selected: true }).outline,
    )
  })
})
