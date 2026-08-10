/**
 * The Enterprise row is being migrated to `NULL` on every ceiling — team size
 * and drafts join `max_projects`, which was already null. These pin that an
 * all-null plan gates nothing and meters nothing, and that the `0` the backend
 * still sends for `max_drafts` (its `limit or 0`) is read the same way.
 */

import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedOrganizationUsageDTO } from '@/tests/fixtures'

import { usePlanLimit, type PlanLimitResource } from './use-plan-limit'

function serveUsage(overrides: Record<string, number | null>) {
  server.use(
    http.get('*/v1/organizations/*/usage', () =>
      HttpResponse.json({ ...seedOrganizationUsageDTO(), ...overrides }),
    ),
  )
}

function renderLimit(resource: PlanLimitResource) {
  const store = makeStore()
  return renderHook(() => usePlanLimit(resource), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  })
}

const ENTERPRISE_ALL_NULL = {
  current_team_size: 90,
  max_team_size: null,
  current_projects: 400,
  max_projects: null,
  current_drafts: 120,
  max_drafts: null,
}

describe('usePlanLimit', () => {
  it.each<PlanLimitResource>(['projects', 'drafts', 'members'])(
    'never blocks %s on an all-null Enterprise plan',
    async (resource) => {
      serveUsage(ENTERPRISE_ALL_NULL)
      const { result } = renderLimit(resource)

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.max).toBeNull()
      expect(result.current.isAtLimit).toBe(false)
    },
  )

  it('reads the backend’s `max_drafts: 0` as unlimited, not as zero allowed', async () => {
    serveUsage({ current_drafts: 7, max_drafts: 0 })
    const { result } = renderLimit('drafts')

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.max).toBeNull()
    expect(result.current.isAtLimit).toBe(false)
  })

  it('blocks on a real ceiling, and reports the numbers behind it', async () => {
    serveUsage({ current_team_size: 5, max_team_size: 5 })
    const { result } = renderLimit('members')

    await waitFor(() => expect(result.current.isAtLimit).toBe(true))
    expect(result.current.used).toBe(5)
    expect(result.current.max).toBe(5)
  })

  it('says "I don’t know yet" rather than "you can’t" before usage lands', () => {
    const { result } = renderLimit('projects')

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAtLimit).toBe(false)
  })
})
