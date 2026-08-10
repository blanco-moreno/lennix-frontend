import { screen } from '@testing-library/react'
import { AlertTriangle, Clock } from 'lucide-react'

import { renderWithProviders } from '@/tests/render-with-providers'
import { heroKpiMessages } from '@/utils'

import { HeroKpis } from './hero-kpis'

const kpis = [
  {
    id: 'atRiskTasks' as const,
    label: heroKpiMessages.atRiskTasks,
    icon: AlertTriangle,
    semantic: 'warning',
    value: 3,
    unit: 'count' as const,
  },
  {
    id: 'activationWait' as const,
    label: heroKpiMessages.activationWait,
    icon: Clock,
    semantic: 'info',
    value: 1,
    unit: 'days' as const,
  },
]

describe('HeroKpis', () => {
  it('renders every hero KPI in one grid', () => {
    renderWithProviders(<HeroKpis kpis={kpis} />)

    expect(screen.getByTestId('hero-kpi-grid')).toBeInTheDocument()
    expect(screen.getByText('Activities at risk')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders a duration as a duration, not a bare number', () => {
    renderWithProviders(<HeroKpis kpis={kpis} />)

    expect(screen.getByText('1 day')).toBeInTheDocument()
  })

  it('says nothing is pending instead of showing a zero', () => {
    renderWithProviders(<HeroKpis kpis={[{ ...kpis[1], value: null }]} />)

    expect(screen.getByText('Nothing pending')).toBeInTheDocument()
    expect(screen.queryByText('0 days')).not.toBeInTheDocument()
  })

  it('renders a KPI with a destination as a link, and one without as a tile', () => {
    renderWithProviders(
      <HeroKpis
        kpis={[{ ...kpis[0], href: '/tasks?tab=list&risk=at_risk' }, kpis[1]]}
      />,
      { route: '/dashboard' },
    )

    // An address, not a click handler: it opens in a new tab, copies, and
    // reads as navigable without any of that being re-implemented.
    expect(screen.getByTestId('hero-kpi-link-atRiskTasks')).toHaveAttribute(
      'href',
      '/tasks?tab=list&risk=at_risk',
    )
    expect(
      screen.queryByTestId('hero-kpi-link-activationWait'),
    ).not.toBeInTheDocument()
  })

  it('surfaces a failed query instead of rendering empty tiles', () => {
    renderWithProviders(<HeroKpis kpis={[]} hasError />)

    expect(
      screen.getByText('Could not load the indicators'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('hero-kpi-grid')).not.toBeInTheDocument()
  })
})
