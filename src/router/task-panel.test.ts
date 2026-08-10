/**
 * The section vocabulary of the activity page, and the decoder that keeps
 * legacy `?activity=&panel=` links landing on their section.
 */

import { TASK_PANEL_OPEN, resolveTaskPanel } from './task-panel'

describe('activity panel address', () => {
  it('reads an explicit section out of the legacy form', () => {
    expect(resolveTaskPanel('dependencies', { canViewBudget: false })).toEqual({
      open: true,
      tab: 'dependencies',
    })
    expect(resolveTaskPanel('subtasks', { canViewBudget: true })).toEqual({
      open: true,
      tab: 'subtasks',
    })
  })

  it('is closed when the URL says nothing', () => {
    expect(resolveTaskPanel(null, { canViewBudget: true })).toEqual({
      open: false,
      tab: null,
    })
  })

  it('opens without naming a section for the shareable short form — the page picks', () => {
    expect(resolveTaskPanel(TASK_PANEL_OPEN, { canViewBudget: true })).toEqual({
      open: true,
      tab: null,
    })
  })

  it('still opens on an unknown section — the row is what was asked for', () => {
    expect(resolveTaskPanel('nonsense', { canViewBudget: true })).toEqual({
      open: true,
      tab: null,
    })
  })

  it('falls back to the default section when the role cannot see budget', () => {
    expect(resolveTaskPanel('budget', { canViewBudget: false })).toEqual({
      open: true,
      tab: null,
    })
    expect(resolveTaskPanel('budget', { canViewBudget: true })).toEqual({
      open: true,
      tab: 'budget',
    })
  })
})
