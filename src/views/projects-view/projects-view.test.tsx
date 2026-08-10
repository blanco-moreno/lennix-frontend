import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectsView } from './projects-view'

function renderDashboard(roleId: number) {
  const store = makeStore()
  store.dispatch(
    setUser({
      userId: SEED_IDS.USER_CARLOS_ID,
      email: 'carlos.rodriguez@lennix-test.com',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      phone: null,
      isActive: true,
      planId: null,
      roleId,
      organizationId: SEED_IDS.ORG_LENNIX_ID,
    }),
  )
  return renderWithProviders(<ProjectsView />, {
    store,
    route: '/projects',
  })
}

describe('ProjectsView', () => {
  it('is the one live-project home: heading, filters and the seeded list', async () => {
    renderDashboard(1)

    expect(
      screen.getByText('Manage all construction projects'),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search projects…')).toBeInTheDocument()
    // The list is wired to the seed…
    expect(
      await screen.findByText('Torre Residencial Norte'),
    ).toBeInTheDocument()
    // …and drafts are not repeated here — they have their own home.
    expect(screen.queryByText(/Borrador/)).not.toBeInTheDocument()
  })

  it('sends project creation to the import flow', async () => {
    renderDashboard(1)

    await userEvent.click(screen.getByRole('button', { name: /new project/i }))

    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
      '/projects/import',
    )
  })

  it('offers no creation entry to a role that cannot create', () => {
    // project.create: admin / PE / PM — a project controller only works
    // inside projects that exist.
    renderDashboard(4)

    expect(
      screen.queryByRole('button', { name: /new project/i }),
    ).not.toBeInTheDocument()
  })
})
