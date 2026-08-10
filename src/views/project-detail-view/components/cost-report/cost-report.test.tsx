import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { DEFAULT_SEED_PROJECT_ID, seedCostReportDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { formatMoney } from '@/utils'

import { CostReport } from './cost-report'

function renderReport(projectId = DEFAULT_SEED_PROJECT_ID) {
  return renderWithProviders(<CostReport projectId={projectId} />, {
    store: makeStore(),
  })
}

describe('CostReport', () => {
  it('renders the seeded category breakdown, one badge per category', async () => {
    const report = seedCostReportDTO(DEFAULT_SEED_PROJECT_ID)
    renderReport()

    expect(await screen.findByText('Category breakdown')).toBeInTheDocument()
    // Every seeded category renders as "<category>: <amount>" — derived from
    // the same fixture the MSW handler serves, so a seed change lands here too.
    const categories = Object.entries(report.category_breakdown)
    expect(categories.length).toBeGreaterThan(0)
    for (const [category, amount] of categories) {
      expect(
        screen.getByText(`${category}: ${formatMoney(amount)}`),
      ).toBeInTheDocument()
    }
  })

  it('lists a variance row per seeded main activity with its budget and status', async () => {
    const report = seedCostReportDTO(DEFAULT_SEED_PROJECT_ID)
    renderReport()

    expect(
      await screen.findByText('Variances by main activity'),
    ).toBeInTheDocument()
    for (const variance of report.task_variances) {
      expect(screen.getByText(variance.entity_name)).toBeInTheDocument()
    }
    // The seeded budgets render as money, and each in-budget row carries the
    // "In range" badge (no P1 activity is over budget in the seed).
    const [first] = report.task_variances
    expect(first.budget).not.toBeNull()
    expect(screen.getByText(formatMoney(first.budget))).toBeInTheDocument()
    const inRange = report.task_variances.filter((v) => !v.is_over_budget)
    expect(screen.getAllByText('In range')).toHaveLength(inRange.length)
    expect(screen.queryByText('Over budget')).toBeNull()
  })

  it('shows the error copy when the cost report cannot be loaded', async () => {
    server.use(
      http.get('*/v1/expenses/projects/:projectId/cost-report', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderReport()

    await waitFor(() => {
      expect(
        screen.getByText('Could not load the cost report.'),
      ).toBeInTheDocument()
    })
  })
})
