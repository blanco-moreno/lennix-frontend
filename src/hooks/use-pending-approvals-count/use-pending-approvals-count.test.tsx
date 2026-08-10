import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { pageOf } from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'

import { usePendingApprovalsCount } from './use-pending-approvals-count'

/**
 * The approvals bell: the one push signal that needs a specific person — an
 * approval waiting on them.
 */

// Owner — carries both decision keys.
const APPROVER = {
  userId: SEED_IDS.USER_CARLOS_ID,
  email: 'carlos@lennix.cl',
  firstName: 'Carlos',
  lastName: 'Rodriguez',
  phone: null,
  isActive: true,
  planId: null,
  roleId: 1,
  organizationId: SEED_IDS.ORG_LENNIX_ID,
}

// `user` — carries neither decision key, but does carry both request keys, so
// the same badge counts their own requests still waiting on somebody.
const REQUESTER = { ...APPROVER, roleId: 5 }

// A role id the frontend does not map: no stake, no request.
const UNKNOWN_ROLE = { ...APPROVER, roleId: 99 }

function renderCount(user: typeof APPROVER) {
  const store = makeStore()
  store.dispatch(setUser(user))
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return renderHook(() => usePendingApprovalsCount(), { wrapper })
}

function serve(budget: number, forceStart: number) {
  const urls: string[] = []
  server.use(
    http.get('*/v1/budget-approvals', ({ request }) => {
      urls.push(request.url)
      return HttpResponse.json(
        pageOf(Array.from({ length: budget }, () => ({}))),
      )
    }),
    http.get('*/v1/force-start-requests', ({ request }) => {
      urls.push(request.url)
      return HttpResponse.json(
        pageOf(Array.from({ length: forceStart }, () => ({}))),
      )
    }),
  )
  return urls
}

describe('usePendingApprovalsCount', () => {
  it('adds up both kinds of decision waiting on this user', async () => {
    serve(2, 3)
    const { result } = renderCount(APPROVER)

    await waitFor(() => {
      expect(result.current).toBe(5)
    })
  })

  it('asks only for the pending ones', async () => {
    const urls = serve(1, 1)
    renderCount(APPROVER)

    // Both lists get asked. Not an exact count: the hook polls, so a slow
    // parallel worker can see a re-poll land before the assert runs.
    await waitFor(() => {
      expect(urls.some((url) => url.includes('/v1/budget-approvals'))).toBe(
        true,
      )
      expect(urls.some((url) => url.includes('/v1/force-start-requests'))).toBe(
        true,
      )
    })
    // A decided request is not a thing that needs anybody — every request the
    // hook makes, polls included, asks only for the pending ones.
    for (const url of urls) expect(url).toContain('state=pending')
  })

  it("counts a requester's own pending requests instead of decisions", async () => {
    // Same badge, other side of the flow: the backend scopes both lists to
    // `requestor_id` for a `user`, so what comes back is already theirs.
    serve(4, 4)
    const { result } = renderCount(REQUESTER)

    await waitFor(() => {
      expect(result.current).toBe(8)
    })
  })

  it('asks for nothing at all when the role carries no stake', async () => {
    const urls = serve(4, 4)
    const { result } = renderCount(UNKNOWN_ROLE)

    // Skipped rather than fired-and-403'd: a badge nobody can act on is not
    // worth a request, let alone a polled one.
    await waitFor(() => {
      expect(result.current).toBe(0)
    })
    expect(urls).toEqual([])
  })
})
