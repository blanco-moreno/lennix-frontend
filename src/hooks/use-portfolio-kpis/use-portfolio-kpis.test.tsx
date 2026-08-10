import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedOrganizationDashboardDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { usePortfolioKpis } from './use-portfolio-kpis'

function Probe() {
  const { kpis, isLoading, hasError } = usePortfolioKpis()
  if (isLoading) return <p>loading</p>
  if (hasError) return <p>error</p>
  return (
    <ul>
      {kpis.map((kpi) => (
        <li key={kpi.id} data-testid={kpi.id}>
          {String(kpi.value)}
        </li>
      ))}
    </ul>
  )
}

describe('usePortfolioKpis', () => {
  it('serves the hero KPIs from the one org-dashboard query', async () => {
    renderWithProviders(<Probe />, { store: makeStore(), route: '/dashboard' })

    const dto = seedOrganizationDashboardDTO()
    await waitFor(() => {
      expect(screen.getByTestId('delayedProjects')).toHaveTextContent(
        String(dto.delayed_projects),
      )
    })
    expect(screen.getByTestId('criticalPathSlip')).toHaveTextContent(
      String(dto.critical_path_slip_days),
    )
    expect(screen.getByTestId('atRiskTasks')).toHaveTextContent(
      String(dto.delayed_or_blocked_tasks),
    )
  })

  it('reports a failed aggregate instead of inventing zeros', async () => {
    server.use(
      http.get('*/v1/analytics/organizations/*/dashboard', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )

    renderWithProviders(<Probe />, { store: makeStore(), route: '/dashboard' })

    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument()
    })
  })
})
