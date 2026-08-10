import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { StatusBadge } from './status-badge'

describe('StatusBadge', () => {
  it.each([
    ['status' as const, 'in_progress', 'In progress'],
    ['health' as const, 'over_budget', 'Over budget'],
    ['priority' as const, 'high', 'High'],
    ['approval' as const, 'pending', 'Pending'],
  ])('says the %s in words', (domain, value, word) => {
    renderWithProviders(<StatusBadge domain={domain} value={value} />)

    expect(screen.getByText(word)).toBeInTheDocument()
  })

  it('lets the caller own the wording', () => {
    renderWithProviders(
      <StatusBadge domain="approval" value="approved" label="Force start ok" />,
    )

    expect(screen.getByText('Force start ok')).toBeInTheDocument()
  })

  it('renders a label the caller supplies as a node', () => {
    renderWithProviders(
      <StatusBadge
        domain="status"
        value="delayed"
        label={<span>Delayed by 3 days</span>}
      />,
    )

    expect(screen.getByText('Delayed by 3 days')).toBeInTheDocument()
  })

  // The word is the state. A dot the reader has to have learnt is not a
  // state, and a listing whose states are readable is what makes filtering
  // by one of them worth doing.
  it('says the word at every width, never a colour mark alone', () => {
    const { container } = renderWithProviders(
      <StatusBadge domain="status" value="in_progress" />,
    )

    expect(screen.getByText('In progress')).toBeVisible()
    expect(container.querySelector('[hidden]')).toBeNull()
  })
})
