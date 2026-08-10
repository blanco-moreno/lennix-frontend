/**
 * Route smoke: `/approvals` renders the one approvals home. The bandeja's own
 * behaviour is pinned in `src/views/approvals-view/approvals-view.test.tsx`.
 */

import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { PATHS } from '@/constants'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { pageOf, seedUser } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ApprovalsView } from './approvals-view'

describe('ApprovalsView', () => {
  it('renders the approvals home on its route', async () => {
    // The mock set carries no budget-approvals handler; answer it locally.
    server.use(
      http.get('*/v1/budget-approvals', () => HttpResponse.json(pageOf([]))),
    )

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

    renderWithProviders(<ApprovalsView />, { store, route: PATHS.APPROVALS })

    expect(
      await screen.findByText('Decisions someone is waiting on.'),
    ).toBeInTheDocument()
  })
})
