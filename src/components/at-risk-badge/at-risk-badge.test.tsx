import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_FORCE_START } from '@/tests/seed'

import { AtRiskBadge } from './at-risk-badge'

describe('AtRiskBadge', () => {
  it('marks the activity the seed force-started', () => {
    renderWithProviders(<AtRiskBadge atRisk={SEED_FORCE_START.forced.atRisk} />)
    expect(screen.getByText('At risk')).toBeInTheDocument()
  })

  it('renders nothing for an activity that never jumped its dependencies', () => {
    renderWithProviders(
      <AtRiskBadge atRisk={SEED_FORCE_START.upstream.atRisk} />,
    )
    expect(screen.queryByText('At risk')).toBeNull()
  })

  it('does not read the flag off the block state — the mark outlives it', () => {
    // The seed's forced task is `is_blocked: false` and still at risk: the
    // badge is provenance, not current state.
    expect(SEED_FORCE_START.forced.isBlocked).toBe(false)
    renderWithProviders(<AtRiskBadge atRisk={SEED_FORCE_START.forced.atRisk} />)
    expect(screen.getByText('At risk')).toBeInTheDocument()
  })
})
