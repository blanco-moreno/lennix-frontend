import { screen } from '@testing-library/react'

import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { displayedDate } from '@/tests/intl-date'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { DashboardHeader } from './dashboard-header'

/** Role ids: 1 owner (sees the whole organization), 3 manager (their obras). */
function storeWithRole(roleId: number) {
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
      roleId,
      organizationId: SEED_IDS.ORG_LENNIX_ID,
    }),
  )
  return store
}

describe('DashboardHeader', () => {
  it('says what the page is for', () => {
    renderWithProviders(<DashboardHeader />, { store: storeWithRole(1) })

    expect(
      screen.getByText(
        'Portfolio health: what is slipping and what is waiting',
      ),
    ).toBeInTheDocument()
  })

  it('names the scope for a role whose aggregates the backend narrows', () => {
    // A manager reads the same screen over their own obras only. Without this
    // line one slipping obra reads as the whole company slipping.
    renderWithProviders(<DashboardHeader />, { store: storeWithRole(3) })

    expect(
      screen.getByText('Your obras: what is slipping and what is waiting'),
    ).toBeInTheDocument()
  })

  it('does not print a render-clock timestamp', () => {
    renderWithProviders(<DashboardHeader />, { store: storeWithRole(1) })

    // "Updated: <now>" was formatted from the browser clock, so it said
    // nothing about the data it sat above.
    expect(screen.queryByText(/Updated:/)).toBeNull()
    expect(
      screen.queryByText(displayedDate(new Date()), { exact: false }),
    ).toBeNull()
  })
})
