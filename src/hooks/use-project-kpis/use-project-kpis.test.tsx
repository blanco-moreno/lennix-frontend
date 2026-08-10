import { screen, waitFor } from '@testing-library/react'

import { makeStore } from '@/stores'
import { seedProjectDashboardDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { useProjectKpis } from './use-project-kpis'

function Probe({ projectId }: { projectId: string }) {
  const { kpis, isLoading } = useProjectKpis(projectId)
  if (isLoading) return <p>loading</p>
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

describe('useProjectKpis', () => {
  it('scopes the same hero signals to one project', async () => {
    const projectId = SEED_IDS.PROJECT_TORRE_ID
    renderWithProviders(<Probe projectId={projectId} />, {
      store: makeStore(),
      route: `/projects/${projectId}`,
    })

    const dto = seedProjectDashboardDTO(projectId)
    await waitFor(() => {
      expect(screen.getByTestId('atRiskTasks')).toHaveTextContent(
        String(dto.delayed_or_blocked_tasks),
      )
    })
    expect(screen.getByTestId('criticalPathSlip')).toHaveTextContent(
      String(dto.critical_path_slip_days),
    )
  })

  it('does not query until it has a project', () => {
    renderWithProviders(<Probe projectId="" />, { store: makeStore() })

    expect(screen.getByText('loading')).toBeInTheDocument()
  })
})
