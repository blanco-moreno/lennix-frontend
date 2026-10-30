import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedProjectDetailDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { useProjectCurrency } from './use-project-currency'

function Probe({ projectId }: { projectId?: string }) {
  const { currency, formatMoney } = useProjectCurrency(projectId)
  return (
    <p data-testid="money">
      {currency} {formatMoney(1234567)}
    </p>
  )
}

describe('useProjectCurrency', () => {
  const projectId = SEED_IDS.PROJECT_TORRE_ID

  it("formats in the project's currency, the way its market writes it", async () => {
    server.use(
      http.get(`*/v1/projects/${projectId}`, () =>
        HttpResponse.json(seedProjectDetailDTO(projectId, { currency: 'CLP' })),
      ),
    )
    renderWithProviders(<Probe projectId={projectId} />, { store: makeStore() })

    await waitFor(() => {
      expect(screen.getByTestId('money')).toHaveTextContent('CLP $1.234.567')
    })
  })

  it('reads the project the route names', async () => {
    server.use(
      http.get(`*/v1/projects/${projectId}`, () =>
        HttpResponse.json(seedProjectDetailDTO(projectId, { currency: 'CLP' })),
      ),
    )
    renderWithProviders(<Probe />, {
      store: makeStore(),
      route: `/projects/${projectId}`,
      path: '/projects/:projectId',
    })

    await waitFor(() => {
      expect(screen.getByTestId('money')).toHaveTextContent('CLP')
    })
  })

  it('reads a project from before the currency existed as USD', async () => {
    renderWithProviders(<Probe projectId={projectId} />, { store: makeStore() })

    await waitFor(() => {
      expect(screen.getByTestId('money')).toHaveTextContent('USD $1,234,567.00')
    })
  })

  it('reads USD outside a project', () => {
    renderWithProviders(<Probe />, { store: makeStore() })

    expect(screen.getByTestId('money')).toHaveTextContent('USD $1,234,567.00')
  })
})
