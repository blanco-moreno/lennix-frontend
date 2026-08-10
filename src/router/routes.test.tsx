/**
 * The route table itself: every address in `PATHS` resolves to a registered
 * route, so a renamed constant or a dropped registration fails here instead of
 * 404ing in the browser.
 */

import { isValidElement, type ReactElement } from 'react'
import type { RouteObject } from 'react-router'

import { PATHS } from '@/constants'

import { HomeRedirect } from './guards/home-redirect'
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

function collectLeaves(
  routeList: RouteObject[],
  found: RouteObject[] = [],
): RouteObject[] {
  for (const route of routeList) {
    if (route.children) collectLeaves(route.children, found)
    else found.push(route)
  }
  return found
}

describe('route table', () => {
  it.each(Object.entries(PATHS))(
    '%s (%s) is a registered route',
    (_name, path) => {
      const route = findRoute(routes, path)
      expect(route).toBeDefined()
      expect(route?.element).toBeDefined()
    },
  )

  // The root is not a fixed redirect any more: `dashboard.view` is not the
  // `user` role's, so which home somebody lands on is a decision, and it is
  // taken behind `AuthGuard` where the role has already resolved.
  it('sends the root to the role-aware home, inside the auth guard', () => {
    const root = findRoute(routes, PATHS.HOME)
    expect(isValidElement(root?.element)).toBe(true)
    expect((root?.element as ReactElement).type).toBe(HomeRedirect)
  })

  it('addresses an activity inside its project, never as a bare task page', () => {
    // The page lives in the project's address space — the URL says whose
    // schedule it belongs to. The old bare address stays gone.
    expect(findRoute(routes, PATHS.TASK_DETAIL)).toBeDefined()
    expect(findRoute(routes, '/tasks/:taskId')).toBeUndefined()
  })

  it('registers a catch-all for unknown addresses', () => {
    const catchAll = findRoute(routes, '*')
    expect(catchAll?.element).toBeDefined()
  })

  it('attaches an error boundary to every leaf route', () => {
    // A broken screen stays contained to its own outlet (withRouteBoundaries).
    for (const leaf of collectLeaves(routes)) {
      expect(leaf.errorElement).toBeDefined()
    }
  })
})
