import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Card } from '@/components'
import { renderWithProviders } from '@/tests/render-with-providers'
import { budgetApprovalsMessages as m } from '@/utils'

import { ApprovalSection } from './approval-section'

interface Row {
  id: string
  name: string
}

const filterMessages = {
  all: m.filterAllStates,
  pending: m.filterStatePending,
  approved: m.filterStateApproved,
  rejected: m.filterStateRejected,
}

function renderSection({
  stateFilter = 'pending',
  onStateFilterChange = vi.fn(),
  isLoading = false,
  rows = [] as Row[],
  error = undefined as ReactNode,
  children = undefined as ReactNode,
} = {}) {
  renderWithProviders(
    <ApprovalSection<Row>
      stateFilter={stateFilter}
      onStateFilterChange={onStateFilterChange}
      filterMessages={filterMessages}
      emptyTitle={m.emptyTitle}
      emptyBody={m.emptyBody}
      isLoading={isLoading}
      rows={rows}
      listLabel={m.bandejaTitle}
      gridColumns={{ base: 'minmax(0, 1fr)' }}
      header={<span role="row" />}
      renderRow={(row) => <Card key={row.id}>{row.name}</Card>}
      error={error}
    >
      {children}
    </ApprovalSection>,
  )
  return { onStateFilterChange }
}

describe('ApprovalSection', () => {
  it('renders the state filter with all four options', async () => {
    renderSection()

    await userEvent.click(screen.getByRole('combobox'))
    expect(
      await screen.findByRole('option', { name: 'All states' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Approved' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Rejected' })).toBeInTheDocument()
  })

  it('reports the picked state through onStateFilterChange', async () => {
    const { onStateFilterChange } = renderSection()

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(
      await screen.findByRole('option', { name: 'Approved' }),
    )

    expect(onStateFilterChange).toHaveBeenCalledWith('approved')
  })

  it('shows the empty state when there are no rows', () => {
    renderSection()

    expect(screen.getByText('No requests')).toBeInTheDocument()
  })

  it('renders each row through renderRow once loaded', () => {
    renderSection({
      rows: [
        { id: '1', name: 'Row uno' },
        { id: '2', name: 'Row dos' },
      ],
    })

    expect(screen.getByText('Row uno')).toBeInTheDocument()
    expect(screen.getByText('Row dos')).toBeInTheDocument()
    expect(screen.queryByText('No requests')).not.toBeInTheDocument()
  })

  it('renders the error node in place of the triad', () => {
    renderSection({
      rows: [{ id: '1', name: 'Row uno' }],
      error: <div>Could not load</div>,
    })

    expect(screen.getByText('Could not load')).toBeInTheDocument()
    expect(screen.queryByText('Row uno')).not.toBeInTheDocument()
  })

  it('shows neither rows nor empty state while loading', () => {
    renderSection({ isLoading: true })

    expect(screen.queryByText('No requests')).not.toBeInTheDocument()
  })

  it('renders children after the list (the decide dialog slot)', () => {
    renderSection({ children: <div>dialog slot</div> })

    expect(screen.getByText('dialog slot')).toBeInTheDocument()
  })
})
