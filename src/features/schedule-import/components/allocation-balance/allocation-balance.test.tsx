import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'
import { formatMoney } from '@/utils'

import { AllocationBalance } from './allocation-balance'

describe('AllocationBalance', () => {
  it('shows what is left while the split fits the budget, with no message', () => {
    renderWithProviders(
      <AllocationBalance
        allocation={{
          assigned: 30000,
          unassigned: 70000,
          overrun: false,
          currency: 'USD',
        }}
      />,
    )

    expect(screen.getByText(formatMoney(100000))).toBeInTheDocument()
    expect(screen.getByText('Unassigned')).toBeInTheDocument()
    expect(screen.getByTestId('allocation-remainder')).toHaveTextContent(
      formatMoney(70000),
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('names the excess once and says it does not block', () => {
    renderWithProviders(
      <AllocationBalance
        allocation={{
          assigned: 130000,
          unassigned: -30000,
          overrun: true,
          currency: 'USD',
        }}
      />,
    )

    expect(screen.getByText('Over budget')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      `Over by ${formatMoney(30000)}. You can still activate.`,
    )
  })

  it('asks for a budget instead of inventing a remainder', () => {
    renderWithProviders(
      <AllocationBalance
        allocation={{
          assigned: 5000,
          unassigned: null,
          overrun: false,
          currency: 'USD',
        }}
      />,
    )

    expect(screen.getByText('Not set')).toBeInTheDocument()
    expect(screen.queryByTestId('allocation-remainder')).not.toBeInTheDocument()
    expect(
      screen.getByText('Enter the project budget to see the balance.'),
    ).toBeInTheDocument()
  })
})
