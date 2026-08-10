import { isValidElement, type ReactElement } from 'react'
import type { RouteObject } from 'react-router'

import { PATHS } from '@/constants'
import type { Permission } from '@/utils'

import { PermissionGuard } from './guards/permission-guard'
import { routes } from './routes'

/** Walk the route tree and collect the guards protecting each concrete path. */
function collectGuards(
  routeList: RouteObject[],
  inherited: Permission[] = [],
  found: Map<string, Permission[]> = new Map(),
): Map<string, Permission[]> {
  for (const route of routeList) {
    const guards = [...inherited]
    if (
      isValidElement(route.element) &&
      route.element.type === PermissionGuard
    ) {
      const { permission } = (
        route.element as ReactElement<{ permission: Permission }>
      ).props
      guards.push(permission)
    }
    if (route.path) found.set(route.path, guards)
    if (route.children) collectGuards(route.children, guards, found)
  }
  return found
}

describe('import route permission guards', () => {
  const guards = collectGuards(routes)

  it.each([
    PATHS.PROJECT_IMPORT,
    PATHS.DRAFT_REVIEW,
    PATHS.IMPORT_ASSISTED_MAPPING,
  ])('%s requires project.create', (path) => {
    expect(guards.get(path)).toContain('project.create')
  })

  it.each([PATHS.PROJECTS, PATHS.DRAFTS])('leaves %s ungated', (path) => {
    // Sanity check that the helper isn't just reporting the guard everywhere;
    // seeing your own drafts is not the same permission as creating one.
    expect(guards.get(path)).toEqual([])
  })
})

describe('role-scoped access route guards (2026-07-31)', () => {
  const guards = collectGuards(routes)

  it('requires org.team.manage for the team management route', () => {
    // The org roster page is admin-only, not visible to every org member.
    expect(guards.get(PATHS.TEAM_MANAGEMENT)).toContain('org.team.manage')
  })
})

describe('tightened role access route guards (2026-07-31, owner)', () => {
  const guards = collectGuards(routes)

  it('requires dashboard.view for /dashboard', () => {
    expect(guards.get(PATHS.DASHBOARD)).toContain('dashboard.view')
  })
})
