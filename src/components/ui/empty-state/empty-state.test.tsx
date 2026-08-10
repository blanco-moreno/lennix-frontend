import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FolderOpen } from 'lucide-react'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders title and description', () => {
    renderWithProviders(
      <EmptyState
        title="No projects yet"
        description="Import a schedule to get started"
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'No projects yet' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Import a schedule to get started'),
    ).toBeInTheDocument()
  })

  it('omits the description and action when not given', () => {
    renderWithProviders(<EmptyState title="Nothing here" />)
    expect(
      screen.getByRole('heading', { name: 'Nothing here' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the action button and fires its callback', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(
      <EmptyState
        title="No tasks"
        action={{ label: 'Create task', onClick }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders a custom icon', () => {
    const { container } = renderWithProviders(
      <EmptyState title="Empty" icon={FolderOpen} />,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
