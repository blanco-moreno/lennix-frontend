/**
 * The path builders `task-panel.test.ts` does not already pin, plus the
 * last-visited-route storage that login restores from.
 */

import { LOCAL_STORAGE_KEYS } from '@/constants'

import {
  buildAssistedMappingPath,
  buildDraftReviewPath,
  buildProjectDetailPath,
  clearLastVisitedRoute,
  getLastVisitedRoute,
  saveLastVisitedRoute,
} from './router-utils'

describe('path builders', () => {
  it('builds the project detail address', () => {
    expect(buildProjectDetailPath('p-1')).toBe('/projects/p-1')
  })

  it('addresses a draft by its own id, on the resumable review canvas (D35)', () => {
    expect(buildDraftReviewPath('p-1')).toBe('/drafts/p-1/review')
  })

  it('addresses a diverted upload by its job, not a project (Lane F)', () => {
    // The quality floor diverts before anything is landed, so there is no
    // draft id to hang the address on.
    expect(buildAssistedMappingPath('job-7')).toBe('/imports/job-7/mapping')
  })

  it('leaves no route placeholder behind', () => {
    expect(buildProjectDetailPath('p-1')).not.toContain(':')
    expect(buildDraftReviewPath('p-1')).not.toContain(':')
    expect(buildAssistedMappingPath('job-7')).not.toContain(':')
  })
})

describe('last visited route storage', () => {
  afterEach(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_VISITED_ROUTE)
  })

  it('round-trips the route through localStorage', () => {
    saveLastVisitedRoute('/projects/p-1')
    expect(getLastVisitedRoute()).toBe('/projects/p-1')
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_VISITED_ROUTE)).toBe(
      '/projects/p-1',
    )
  })

  it('clears the stored route', () => {
    saveLastVisitedRoute('/tasks')
    clearLastVisitedRoute()
    expect(getLastVisitedRoute()).toBeNull()
  })

  it('answers null when nothing was stored', () => {
    expect(getLastVisitedRoute()).toBeNull()
  })
})
