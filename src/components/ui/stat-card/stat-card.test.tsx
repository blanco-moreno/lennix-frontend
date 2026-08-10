import { screen } from '@testing-library/react'
import { DollarSign } from 'lucide-react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { StatCard } from './stat-card'

describe('StatCard', () => {
  it('renders label and value', () => {
    renderWithProviders(
      <StatCard
        icon={DollarSign}
        label="Budget"
        value="$1,500,000"
        semantic="success"
      />,
    )
    expect(screen.getByText('Budget')).toBeInTheDocument()
    expect(screen.getByText('$1,500,000')).toBeInTheDocument()
  })

  it('renders its icon', () => {
    const { container } = renderWithProviders(
      <StatCard icon={DollarSign} label="Spent" value="$0" semantic="info" />,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('supports the card variant, including long values', () => {
    renderWithProviders(
      <StatCard
        icon={DollarSign}
        label="Location"
        value="Avenida Reforma 123, Ciudad de Mexico"
        semantic="default"
        variant="card"
        isLong
      />,
    )
    expect(
      screen.getByText('Avenida Reforma 123, Ciudad de Mexico'),
    ).toBeInTheDocument()
  })

  it('does not throw for any semantic key it is used with', () => {
    const semantics = [
      'success',
      'info',
      'destructive',
      'critical',
      'overBudget',
      'error',
      'warning',
      'complementary',
      'default',
    ]
    for (const semantic of semantics) {
      expect(() =>
        renderWithProviders(
          <StatCard
            icon={DollarSign}
            label={semantic}
            value="1"
            semantic={semantic}
          />,
        ),
      ).not.toThrow()
    }
  })
})
