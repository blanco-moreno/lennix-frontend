import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedProjectListDTO } from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { DashboardDrafts } from './dashboard-drafts'

function renderNudge() {
  return renderWithProviders(<DashboardDrafts />, {
    store: makeStore(),
    route: '/dashboard',
  })
}

describe('DashboardDrafts', () => {
  it('is one nudge, not a second grid of draft cards', async () => {
    renderNudge()

    const nudge = await screen.findByTestId('dashboard-drafts-nudge')
    expect(nudge).toBeInTheDocument()
    // The seed carries three pending drafts.
    expect(screen.getByText('3 drafts waiting for you')).toBeInTheDocument()
    expect(
      screen.queryByText('Ampliacion Bodega Logistica (Borrador)'),
    ).not.toBeInTheDocument()
  })

  it('deep-links to the drafts home from a real button, not a clickable card', async () => {
    renderNudge()

    const nudge = await screen.findByTestId('dashboard-drafts-nudge')
    await userEvent.click(nudge)
    expect(screen.getByTestId(LOCATION_TEST_ID)).not.toHaveTextContent(
      '/drafts',
    )

    await userEvent.click(screen.getByRole('button', { name: /drafts/i }))

    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent('/drafts')
  })

  it('stays out of the way when there is nothing pending', async () => {
    server.use(
      http.get('*/v1/projects*', () =>
        HttpResponse.json(
          seedProjectListDTO().filter((project) => !project.is_draft),
        ),
      ),
    )
    renderNudge()

    await waitFor(() =>
      expect(
        screen.queryByTestId('dashboard-drafts-nudge'),
      ).not.toBeInTheDocument(),
    )
  })
})
