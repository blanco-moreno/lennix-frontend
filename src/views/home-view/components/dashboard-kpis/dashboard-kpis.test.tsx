import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { DashboardKpis } from './dashboard-kpis'

function renderKpis() {
  return renderWithProviders(<DashboardKpis />, {
    store: makeStore(),
    route: '/dashboard',
  })
}

describe('DashboardKpis', () => {
  it('renders the hero signals, not generic PM counters', async () => {
    renderKpis()

    await waitFor(() => {
      expect(screen.getByTestId('hero-kpi-grid')).toBeInTheDocument()
    })
    expect(screen.getByText('Delayed projects')).toBeInTheDocument()
    expect(screen.getByText('Critical-path slip')).toBeInTheDocument()
    expect(screen.getByText('Activities at risk')).toBeInTheDocument()
    expect(screen.getByText('Waiting to activate')).toBeInTheDocument()
    // Generic counters (active projects, team size) are not KPIs here.
    expect(screen.queryByText(/active projects/i)).toBeNull()
    expect(screen.queryByText(/team size/i)).toBeNull()
  })

  it('surfaces a failed aggregate instead of tiles full of zeros', async () => {
    server.use(
      http.get('*/v1/analytics/organizations/*/dashboard', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderKpis()

    expect(
      await screen.findByText('Could not load the indicators'),
    ).toBeInTheDocument()
  })
})
