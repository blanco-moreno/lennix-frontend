/**
 * The list URL vocabulary: a bad link must degrade to an unfiltered list, a
 * default must never be written, and what is written must read back identical.
 */

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/constants'

import {
  activeListFilters,
  EMPTY_LIST_QUERY_STATE,
  LIST_PARAMS,
  parseListQuery,
  serializeListQuery,
  type ListQueryState,
} from './list-query-state'

const parse = (query: string, surface: 'projects' | 'tasks' | 'assigned') =>
  parseListQuery(new URLSearchParams(query), surface)

describe('parseListQuery', () => {
  it('reads a full tasks URL', () => {
    const state = parse(
      'search=slab&status=todo&project=p1&priority=high&assignee=u1&risk=at_risk&blocked=true&over_budget=false&critical=true&due_after=2026-01-01&due_before=2026-12-31&sort=-delay_days&page=3&page_size=10',
      'tasks',
    )

    expect(state).toEqual({
      search: 'slab',
      status: 'todo',
      project: 'p1',
      priority: 'high',
      assignee: 'u1',
      risk: 'at_risk',
      blocked: true,
      overBudget: false,
      critical: true,
      dueAfter: '2026-01-01',
      dueBefore: '2026-12-31',
      sort: '-delay_days',
      page: 3,
      pageSize: 10,
    } satisfies ListQueryState)
  })

  it.each([
    ['page=abc', 'page', 1],
    ['page=0', 'page', 1],
    ['page=-4', 'page', 1],
    ['page=2.5', 'page', 1],
    ['page_size=abc', 'pageSize', DEFAULT_PAGE_SIZE],
    ['page_size=0', 'pageSize', DEFAULT_PAGE_SIZE],
    ['status=invented', 'status', null],
    ['priority=urgent', 'priority', null],
    ['risk=delayed', 'risk', null],
    ['blocked=yes', 'blocked', null],
    ['critical=1', 'critical', null],
    ['due_before=tomorrow', 'dueBefore', null],
    ['due_before=2026-02-31', 'dueBefore', null],
    ['due_after=26-01-01', 'dueAfter', null],
    ['sort=whatever', 'sort', null],
    ['sort=progress', 'sort', null],
  ])('%s degrades to the default', (query, key, expected) => {
    expect(parse(query, 'tasks')[key as keyof ListQueryState]).toBe(expected)
  })

  it.each([
    [`${LIST_PARAMS.pageSize}=999`, MAX_PAGE_SIZE],
    [`${LIST_PARAMS.pageSize}=${MAX_PAGE_SIZE}`, MAX_PAGE_SIZE],
    [`${LIST_PARAMS.pageSize}=10`, 10],
  ])('%s clamps the page size to %s', (query, expected) => {
    expect(parse(query, 'projects').pageSize).toBe(expected)
  })

  it('drops filters the surface does not support', () => {
    const state = parse('critical=true&project=p1&status=todo', 'projects')

    expect(state.critical).toBeNull()
    expect(state.project).toBeNull()
    // `todo` is an activity status, not an obra one.
    expect(state.status).toBeNull()
  })

  it('keeps the project statuses on the projects surface', () => {
    expect(parse('status=delayed', 'projects').status).toBe('delayed')
    expect(parse('sort=-progress', 'projects').sort).toBe('-progress')
  })
})

describe('serializeListQuery', () => {
  it('writes nothing when everything is at its default', () => {
    const params = serializeListQuery(EMPTY_LIST_QUERY_STATE, 'tasks')

    expect(params.toString()).toBe('')
  })

  it('omits page 1 and the default page size', () => {
    const params = serializeListQuery(
      { ...EMPTY_LIST_QUERY_STATE, priority: 'high' },
      'tasks',
    )

    expect(params.toString()).toBe('priority=high')
  })

  it('keeps params it does not own', () => {
    const params = serializeListQuery(
      { ...EMPTY_LIST_QUERY_STATE, blocked: true },
      'tasks',
      new URLSearchParams('tab=list'),
    )

    expect(params.get('tab')).toBe('list')
    expect(params.get(LIST_PARAMS.blocked)).toBe('true')
  })

  it('deletes a filter that fell back to its default', () => {
    const params = serializeListQuery(
      EMPTY_LIST_QUERY_STATE,
      'tasks',
      new URLSearchParams('priority=high&page=4'),
    )

    expect(params.toString()).toBe('')
  })

  it('round-trips a state through the URL unchanged', () => {
    const state: ListQueryState = {
      search: 'slab',
      status: 'in_progress',
      project: 'p1',
      priority: 'low',
      assignee: 'u1',
      risk: 'at_risk',
      blocked: false,
      overBudget: true,
      critical: false,
      dueAfter: '2026-03-01',
      dueBefore: '2026-03-31',
      sort: 'priority',
      page: 4,
      pageSize: MAX_PAGE_SIZE,
    }

    expect(parseListQuery(serializeListQuery(state, 'tasks'), 'tasks')).toEqual(
      state,
    )
  })
})

describe('activeListFilters', () => {
  it('lists one removable entry per narrowed filter', () => {
    const state = parse('search=slab&blocked=true&page=3&sort=title', 'tasks')

    expect(activeListFilters(state, 'tasks')).toEqual([
      { key: 'search', value: 'slab' },
      { key: 'blocked', value: 'true' },
    ])
  })

  it('counts a false boolean as a filter — "within budget" narrows too', () => {
    const state = parse('over_budget=false', 'tasks')

    expect(activeListFilters(state, 'tasks')).toEqual([
      { key: 'overBudget', value: 'false' },
    ])
  })

  it('is empty on an unfiltered list', () => {
    expect(activeListFilters(EMPTY_LIST_QUERY_STATE, 'projects')).toEqual([])
  })
})
