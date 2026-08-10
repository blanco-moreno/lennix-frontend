import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'
import { formatMoney } from '@/utils'

import { BudgetSummary } from './budget-summary'

function renderSummary(overrides?: { isOverBudget?: boolean }) {
  const isOverBudget = overrides?.isOverBudget ?? false
  return renderWithProviders(
    <BudgetSummary
      budgetLabel="Total budget"
      budgetValue={formatMoney(1000)}
      spentLabel="Spent"
      spent={400}
      remainingLabel={isOverBudget ? 'Over budget' : 'Remaining'}
      remaining={isOverBudget ? -200 : 600}
      isOverBudget={isOverBudget}
      overBudgetAlertTitle="Budget exceeded"
      overBudgetAlertBody="Exceeded by amount."
    >
      <div>surface section</div>
    </BudgetSummary>,
  )
}

describe('BudgetSummary', () => {
  it('renders the three tiles with formatted values and the caller sections, no alert in budget', () => {
    renderSummary()

    expect(screen.getByText('Total budget')).toBeInTheDocument()
    expect(screen.getByText(formatMoney(1000))).toBeInTheDocument()
    expect(screen.getByText('Spent')).toBeInTheDocument()
    expect(screen.getByText(formatMoney(400))).toBeInTheDocument()
    expect(screen.getByText('Remaining')).toBeInTheDocument()
    expect(screen.getByText(formatMoney(600))).toBeInTheDocument()
    expect(screen.getByText('surface section')).toBeInTheDocument()
    expect(screen.queryByText('Budget exceeded')).not.toBeInTheDocument()
  })

  it('shows the absolute remaining and the alert when over budget', () => {
    renderSummary({ isOverBudget: true })

    expect(screen.getByText('Over budget')).toBeInTheDocument()
    expect(screen.getByText(formatMoney(200))).toBeInTheDocument()
    expect(screen.getByText('Budget exceeded')).toBeInTheDocument()
    expect(screen.getByText('Exceeded by amount.')).toBeInTheDocument()
  })
})
