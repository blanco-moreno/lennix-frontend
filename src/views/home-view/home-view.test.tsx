import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedOrganizationDashboardDTO } from '@/tests/fixtures'
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

/**
 * Pinned, not `new Date()`: on this date Torre (due 2026-08-01) is not yet
 * overdue, which is what makes its absence from the attention list a real
 * absence to assert.
 */
const TODAY = new Date('2026-07-25T00:00:00Z')

describe('HomeView', () => {
  it('stacks the four portfolio-health surfaces, not a second project list', async () => {
    server.use(
      http.get('*/v1/analytics/organizations/:organizationId/dashboard', () =>
        HttpResponse.json(seedOrganizationDashboardDTO(TODAY)),
      ),
    )
    renderWithProviders(<HomeView />, {
      store: ownerStore(),
      route: '/dashboard',
    })

    // Header, hero KPIs, the drafts nudge and the attention list.
    expect(
      screen.getByText(
        'Portfolio health: what is slipping and what is waiting',
      ),
    ).toBeInTheDocument()
    expect(await screen.findByTestId('hero-kpi-grid')).toBeInTheDocument()
    expect(
      await screen.findByTestId('dashboard-drafts-nudge'),
    ).toBeInTheDocument()
    expect(await screen.findByText('Needs your attention')).toBeInTheDocument()

    // Portfolio health, not a projects page: the healthy seed projects are
    // not listed here.
    expect(screen.queryByText('Torre Residencial Norte')).toBeNull()
  })
})
