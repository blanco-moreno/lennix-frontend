/**
 * Route smoke: `/settings/team` renders the org roster. The roster's own
 * behaviour is pinned in `src/views/team-management-view/`.
 */

import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedUser } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { TeamManagementView } from './team-management-view'

describe('TeamManagementView', () => {
  it('renders the organization team on its route', async () => {
    const carlos = seedUser(SEED_IDS.USER_CARLOS_ID)
    const store = makeStore()
    store.dispatch(
      setUser({
        userId: carlos.userId,
        email: carlos.email,
        firstName: carlos.firstName,
        lastName: carlos.lastName,
        phone: null,
        isActive: true,
        planId: null,
        roleId: carlos.roleId,
        organizationId: SEED_IDS.ORG_LENNIX_ID,
      }),
    )

    renderWithProviders(<TeamManagementView />, {
      store,
      route: PATHS.TEAM_MANAGEMENT,
    })

    expect(await screen.findByText('Members')).toBeInTheDocument()
  })
})
