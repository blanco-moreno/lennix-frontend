import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedProjectBudgetDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectBudgetPanel } from './project-budget-panel'

const projectId = SEED_IDS.PROJECT_TORRE_ID

function renderPanel() {
  return renderWithProviders(<ProjectBudgetPanel projectId={projectId} />, {
    store: makeStore(),
    route: `/projects/${projectId}`,
  })
}

describe('ProjectBudgetPanel', () => {
  it('shows the seeded budget arithmetic as money, not wire decimals', async () => {
    renderPanel()

    // Torre: budget 850,000 / spent 637,000 / remaining 213,000 (74.94% used).
    expect(await screen.findByText('Total budget')).toBeInTheDocument()
    expect(screen.getByText('$850,000.00')).toBeInTheDocument()
    expect(screen.getAllByText('$637,000.00').length).toBeGreaterThan(0)
    expect(screen.getByText('$213,000.00')).toBeInTheDocument()
    expect(screen.getByText(/74\.9%/)).toBeInTheDocument()

    // Under budget: the remaining tile says "Remaining", and no alert.
    expect(screen.getByText('Remaining')).toBeInTheDocument()
    expect(screen.queryByText('Over budget')).not.toBeInTheDocument()
    expect(screen.queryByText('Budget exceeded')).not.toBeInTheDocument()
  })

  it('flags an exceeded budget with the overrun amount', async () => {
    server.use(
      http.get(`*/v1/projects/${projectId}/budget`, () =>
        HttpResponse.json({
          ...seedProjectBudgetDTO(projectId),
          budget: '600000.00',
          remaining: '-37000.00',
          is_over_budget: true,
          utilization_percentage: 106.17,
        }),
      ),
    )
    renderPanel()

    expect(await screen.findByText('Over budget')).toBeInTheDocument()
    expect(screen.getByText('Budget exceeded')).toBeInTheDocument()
    // The overrun is shown as a positive amount, not a negative sign.
    expect(
      screen.getByText(/exceeded the budget by \$37,000\.00/),
    ).toBeInTheDocument()
  })

  it('says the budget could not be loaded', async () => {
    server.use(
      http.get(`*/v1/projects/${projectId}/budget`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderPanel()

    expect(
      await screen.findByText('Could not load the budget.'),
    ).toBeInTheDocument()
  })

  it('shows a loading state while the query is in flight', () => {
    renderPanel()

    expect(screen.getByTestId('budget-panel')).toHaveAttribute(
      'aria-busy',
      'true',
    )
  })
})
