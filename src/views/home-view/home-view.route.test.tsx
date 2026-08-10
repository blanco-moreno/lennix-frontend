/**
 * Route smoke: `/dashboard` renders the portfolio home. Its sections are
 * pinned in `src/views/home-view/components/`.
 */

import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { HomeView } from './home-view'

/** The owner: the dashboard's aggregates cover the whole organization. */
function ownerStore() {
  const store = makeStore()
  store.dispatch(
    setUser({
      userId: SEED_IDS.USER_CARLOS_ID,
      email: 'carlos@lennix.cl',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      phone: null,
      isActive: true,
      planId: null,
      roleId: 1,
      organizationId: SEED_IDS.ORG_LENNIX_ID,
    }),
  )
  return store
}

describe('HomeView', () => {
  it('renders the portfolio dashboard on its route', async () => {
    renderWithProviders(<HomeView />, {
      store: ownerStore(),
      route: PATHS.DASHBOARD,
    })

    expect(
      await screen.findByText(
        'Portfolio health: what is slipping and what is waiting',
      ),
    ).toBeInTheDocument()
  })
})
