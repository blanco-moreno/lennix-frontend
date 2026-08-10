import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { FilterChips } from './filter-chips'

const chips = [
  { key: 'status', label: 'In progress' },
  { key: 'priority', label: 'High priority' },
]

describe('FilterChips', () => {
  it('renders nothing while no filter is active', () => {
    renderWithProviders(<FilterChips chips={[]} onRemove={vi.fn()} />)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders one chip per active filter, each naming what it removes', () => {
    renderWithProviders(<FilterChips chips={chips} onRemove={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Remove filter: In progress',
      'Remove filter: High priority',
    ])
  })

  it('removes only the filter whose chip was clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    renderWithProviders(<FilterChips chips={chips} onRemove={onRemove} />)

    await user.click(
      screen.getByRole('button', { name: 'Remove filter: High priority' }),
    )

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith('priority')
  })

  it('reaches every chip by keyboard', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    renderWithProviders(<FilterChips chips={chips} onRemove={onRemove} />)

    await user.tab()
    await user.tab()
    await user.keyboard('{Enter}')

    expect(onRemove).toHaveBeenCalledWith('priority')
  })
})
