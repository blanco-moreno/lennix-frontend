/**
 * List and detail are distinct routed views.
 *
 * `/projects` and `/projects/:projectId` must not resolve to one lazy
 * component that branches on the param — anything that reads the route tree
 * (code-splitting, guards, a layout) would have to know that. The regression
 * this guards is "someone points them at the same element again".
 */

import type { RouteObject } from 'react-router'

import { PATHS } from '@/constants'

import { routes } from './routes'

function findRoute(
  routeList: RouteObject[],
  path: string,
): RouteObject | undefined {
  for (const route of routeList) {
    if (route.path === path) return route
    if (route.children) {
      const child = findRoute(route.children, path)
      if (child) return child
    }
  }
  return undefined
}

describe('project routes (V8)', () => {
  const list = findRoute(routes, PATHS.PROJECTS)
  const detail = findRoute(routes, PATHS.PROJECT_DETAIL)
  const drafts = findRoute(routes, PATHS.DRAFTS)

  it('registers a route for each surface', () => {
    expect(list?.element).toBeDefined()
    expect(detail?.element).toBeDefined()
    expect(drafts?.element).toBeDefined()
  })

  it('gives the list and the detail different views', () => {
    expect(detail?.element).not.toEqual(list?.element)
  })

  it('gives Borradores its own home, not the project list', () => {
    expect(drafts?.element).not.toEqual(list?.element)
    expect(drafts?.element).not.toEqual(detail?.element)
  })
})
