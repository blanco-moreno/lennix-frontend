/**
 * The exported singleton router serves the route table. `routes.test.tsx`
 * pins the table itself; this pins that `createBrowserRouter` was actually
 * handed it — a router built from the wrong module would pass the table test
 * and still 404 every address.
 */

import { PATHS } from '@/constants'

import { router } from './router'

describe('router', () => {
  it('resolves a known address to its registered route', async () => {
    await router.navigate(PATHS.LOGIN)

    expect(router.state.location.pathname).toBe(PATHS.LOGIN)
    expect(router.state.matches.at(-1)?.route.path).toBe(PATHS.LOGIN)
  })

  it('resolves an unknown address to the catch-all', async () => {
    await router.navigate('/no-such-place')

    expect(router.state.matches.at(-1)?.route.path).toBe('*')
  })
})
