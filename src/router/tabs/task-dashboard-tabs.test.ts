import { AT_RISK_LENS, buildAtRiskTasksPath } from '../at-risk-lens'

import {
  DEFAULT_TASK_DASHBOARD_TAB,
  TASK_DASHBOARD_TABS,
  resolveTaskDashboardTab,
} from './task-dashboard-tabs'

describe('the /tasks tabs', () => {
  it('is the list and the assigned queue, list first', () => {
    expect([...TASK_DASHBOARD_TABS]).toEqual(['list', 'assigned'])
    expect(DEFAULT_TASK_DASHBOARD_TAB).toBe('list')
  })

  // Parametrized per file rather than through a shared table: each surface's
  // resolver has its own signature, so a cross-feature helper would cost more
  // than these rows.
  it.each(['assigned', 'list'] as const)(
    'resolves ?tab=%s to itself',
    (tab) => {
      expect(resolveTaskDashboardTab(tab)).toBe(tab)
    },
  )

  it.each([null, undefined, 'nonsense'])(
    'falls back to the list for %s',
    (raw) => {
      expect(resolveTaskDashboardTab(raw)).toBe('list')
    },
  )

  it('takes no permission argument — every role sees both tabs', () => {
    // The portfolio list is never hidden from the roles that only work a queue.
    expect(resolveTaskDashboardTab.length).toBe(1)
  })
})

describe('the at-risk lens', () => {
  it('lands on the list tab, because that is the population the KPI counts', () => {
    const path = buildAtRiskTasksPath()
    const url = new URL(path, 'https://lennix.test')

    expect(url.pathname).toBe('/tasks')
    expect(url.searchParams.get('tab')).toBe('list')
    expect(url.searchParams.get('risk')).toBe(AT_RISK_LENS)
  })

  it('spells the lens the way the list parses it', () => {
    // The tile links with this value and `parseListQuery` accepts only this
    // value: one constant, so the drill-through cannot land unfiltered.
    expect(AT_RISK_LENS).toBe('at_risk')
  })
})
