import {
  DEFAULT_PROJECT_TAB,
  PROJECT_TABS,
  resolveProjectTab,
} from './project-tabs'

const withBudget = { canViewBudget: true, canViewRisks: true }
const withoutBudget = { canViewBudget: false, canViewRisks: true }
const withoutRisks = { canViewBudget: true, canViewRisks: false }

describe('project tabs', () => {
  it('is exactly the final five tabs, schedule first', () => {
    expect([...PROJECT_TABS]).toEqual([
      'schedule',
      'budget',
      'team',
      'risks',
      'history',
    ])
    expect(DEFAULT_PROJECT_TAB).toBe('schedule')
  })

  it('has no overview and no schedule-facet tabs', () => {
    const retired = ['overview', 'tasks', 'dependencies', 'critical-path']
    for (const tab of retired) {
      expect(PROJECT_TABS).not.toContain(tab)
      expect(resolveProjectTab(tab, withBudget)).toBe('schedule')
    }
  })

  // Parametrized per file rather than through a shared table: this resolver
  // takes a permissions argument the other surfaces' resolvers do not.
  it.each(['schedule', 'budget', 'team', 'risks', 'history'] as const)(
    'resolves ?tab=%s to itself',
    (tab) => {
      expect(resolveProjectTab(tab, withBudget)).toBe(tab)
    },
  )

  it.each([null, undefined, 'nonsense'])(
    'falls back to the schedule for %s',
    (raw) => {
      expect(resolveProjectTab(raw, withBudget)).toBe('schedule')
    },
  )

  it('never opens the budget tab without the permission', () => {
    expect(resolveProjectTab('budget', withoutBudget)).toBe('schedule')
  })

  it('never opens the risks tab without the permission', () => {
    expect(resolveProjectTab('risks', withBudget)).toBe('risks')
    expect(resolveProjectTab('risks', withoutRisks)).toBe('schedule')
  })
})
