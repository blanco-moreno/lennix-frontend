import { DEFAULT_TASK_TAB, TASK_TABS, resolveTaskTab } from './task-tabs'

const withBudget = { canViewBudget: true }
const withoutBudget = { canViewBudget: false }

describe('task tabs', () => {
  it('is exactly the three activity tabs, general first', () => {
    expect([...TASK_TABS]).toEqual(['overview', 'subtasks', 'budget'])
    expect(DEFAULT_TASK_TAB).toBe('overview')
  })

  // Parametrized per file rather than through a shared table: this resolver
  // takes a permissions argument the tab-less surfaces' resolvers do not.
  it.each(['overview', 'subtasks', 'budget'] as const)(
    'resolves ?tab=%s to itself',
    (tab) => {
      expect(resolveTaskTab(tab, withBudget)).toBe(tab)
    },
  )

  it.each([null, undefined, 'nonsense'])(
    'falls back to general for %s',
    (raw) => {
      expect(resolveTaskTab(raw, withBudget)).toBe('overview')
    },
  )

  it('never opens the budget tab without the permission', () => {
    expect(resolveTaskTab('budget', withoutBudget)).toBe('overview')
  })
})
