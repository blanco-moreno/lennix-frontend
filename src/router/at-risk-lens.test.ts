/**
 * The at-risk lens vocabulary: the KPI tile and the tasks list must agree on
 * the URL that carries the lens between them. What "at risk" means is the
 * server's answer now — `?risk=at_risk` over the whole organization — so there
 * is no predicate left here to pin.
 */

import { PATHS } from '@/constants'

import {
  AT_RISK_LENS,
  buildAtRiskTasksPath,
  TASK_RISK_PARAM,
} from './at-risk-lens'
import { parseListQuery } from './list-query-state'

describe('the lens the tile writes', () => {
  it('is the one the list parses, so the drill-through cannot land unfiltered', () => {
    const url = new URL(buildAtRiskTasksPath(), 'http://test.local')

    expect(parseListQuery(url.searchParams, 'tasks').risk).toBe(AT_RISK_LENS)
  })
})

describe('buildAtRiskTasksPath', () => {
  it('links to the portfolio list tab with the lens on', () => {
    const url = new URL(buildAtRiskTasksPath(), 'http://test.local')

    expect(url.pathname).toBe(PATHS.TASKS)
    expect(url.searchParams.get('tab')).toBe('list')
    expect(url.searchParams.get(TASK_RISK_PARAM)).toBe(AT_RISK_LENS)
  })
})
