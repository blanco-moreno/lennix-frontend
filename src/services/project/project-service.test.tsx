import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  DEFAULT_SEED_PROJECT_ID,
  seedAssignableMembersDTO,
} from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'

import { useGetAssignableMembersQuery } from './project-service'

const PROJECT_ID = DEFAULT_SEED_PROJECT_ID

function setup() {
  const store = makeStore()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return { store, wrapper }
}

describe('useGetAssignableMembersQuery', () => {
  it('carries the badge facts: who is on the obra and what role they hold', async () => {
    const { wrapper } = setup()

    const { result } = renderHook(
      () => useGetAssignableMembersQuery(PROJECT_ID),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const miguel = result.current.data?.find(
      (member) => member.userId === SEED_IDS.USER_MIGUEL_ID,
    )
    expect(miguel).toMatchObject({
      isProjectMember: true,
      roleSlug: 'manager',
    })
    // Carlos owns the organization and holds no membership row on Torre — the
    // exact person a roster-fed picker would hide.
    expect(
      result.current.data?.find(
        (member) => member.userId === SEED_IDS.USER_CARLOS_ID,
      ),
    ).toMatchObject({ isProjectMember: false, roleSlug: 'owner' })
  })

  it('reads every page: the server caps one at 20 and offers no search', async () => {
    // Split the seeded answer over two pages, as an organization past the cap
    // would arrive. A picker fed page 1 alone would silently drop the rest.
    const rows = seedAssignableMembersDTO(PROJECT_ID)
    const requested: string[] = []
    server.use(
      http.get(
        `*/v1/projects/${PROJECT_ID}/assignable-members`,
        ({ request }) => {
          const page = Number(
            new URL(request.url).searchParams.get('page') ?? '1',
          )
          requested.push(String(page))
          const items = page === 1 ? rows.slice(0, 2) : rows.slice(2)
          return HttpResponse.json({
            items,
            total: rows.length,
            page,
            page_size: 2,
            total_pages: 2,
          })
        },
      ),
    )
    const { wrapper } = setup()

    const { result } = renderHook(
      () => useGetAssignableMembersQuery(PROJECT_ID),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(requested).toEqual(['1', '2'])
    expect(result.current.data).toHaveLength(rows.length)
  })

  it('surfaces a failure instead of a half-read list', async () => {
    server.use(
      http.get(
        `*/v1/projects/${PROJECT_ID}/assignable-members`,
        () => new HttpResponse(null, { status: 403 }),
      ),
    )
    const { wrapper } = setup()

    const { result } = renderHook(
      () => useGetAssignableMembersQuery(PROJECT_ID),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(result.current.data).toBeUndefined()
  })
})
