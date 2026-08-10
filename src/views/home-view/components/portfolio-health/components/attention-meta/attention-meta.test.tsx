import { screen } from '@testing-library/react'

import { mapProjectDTOToProject } from '@/services/project'
import { seedProjectDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { AttentionProject } from '@/types'

import { AttentionMeta } from './attention-meta'

const item = (overrides: Partial<AttentionProject> = {}): AttentionProject => ({
  ...mapProjectDTOToProject(seedProjectDTO(SEED_IDS.PROJECT_CENTRO_ID)),
  delayedOrBlockedTasks: 3,
  criticalPathSlipDays: 5,
  ...overrides,
})

describe('AttentionMeta', () => {
  it('states both schedule numbers', () => {
    renderWithProviders(<AttentionMeta item={item()} />)

    expect(screen.getByText('5 days of critical-path slip')).toBeInTheDocument()
    expect(screen.getByText('3 activities at risk')).toBeInTheDocument()
  })

  it('drops a zero metric instead of announcing "0 at risk"', () => {
    renderWithProviders(
      <AttentionMeta
        item={item({ delayedOrBlockedTasks: 0, criticalPathSlipDays: 0 })}
      />,
    )

    expect(screen.queryByText(/at risk/)).toBeNull()
    expect(screen.queryByText(/critical-path slip/)).toBeNull()
  })

  it('says nothing about WHY the obra is listed — the verdict badge owns that', () => {
    // A "Past its target date" line beside the row, derived from a `reason`
    // field only the home receives, is a second opinion — exactly how the home
    // and `/projects` came to describe the same obra differently. This block
    // is the two numbers the verdict cannot carry, and nothing else.
    renderWithProviders(<AttentionMeta item={item()} />)

    expect(screen.queryByText('Past its target date')).toBeNull()
    expect(screen.queryByText(/Overdue/)).toBeNull()
  })
})
