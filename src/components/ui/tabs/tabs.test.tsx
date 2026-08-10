import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { Tabs } from './tabs'

const items = [
  { value: 'overview', label: 'Overview', content: <p>Overview content</p> },
  { value: 'schedule', label: 'Schedule', content: <p>Schedule content</p> },
  {
    value: 'locked',
    label: 'Locked',
    content: <p>Locked content</p>,
    disabled: true,
  },
]

describe('Tabs', () => {
  it('renders a tab per item and shows the default tab content', () => {
    renderWithProviders(<Tabs defaultValue="overview" items={items} />)
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByText('Overview content')).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('switches content when another tab is clicked and reports the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(
      <Tabs
        defaultValue="overview"
        items={items}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('tab', { name: 'Schedule' }))
    expect(onValueChange).toHaveBeenCalledWith('schedule')
    expect(screen.getByText('Schedule content')).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Schedule' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('does not activate a disabled tab', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(
      <Tabs
        defaultValue="overview"
        items={items}
        onValueChange={onValueChange}
      />,
    )
    const locked = screen.getByRole('tab', { name: 'Locked' })
    expect(locked).toBeDisabled()
    await user.click(locked)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  // Wrapping, not scrolling: a strip that scrolls hides the sections past its
  // edge, and the reader has no way to know they are there.
  it('wraps the tab list and lets listProps override it', () => {
    const { unmount } = renderWithProviders(
      <Tabs defaultValue="overview" items={items} />,
    )
    expect(screen.getByRole('tablist')).toHaveStyle({ flexWrap: 'wrap' })
    unmount()
    renderWithProviders(
      <Tabs
        defaultValue="overview"
        items={items}
        listProps={{ flexWrap: 'nowrap' }}
      />,
    )
    expect(screen.getByRole('tablist')).toHaveStyle({ flexWrap: 'nowrap' })
  })

  it('follows the controlled value prop', () => {
    renderWithProviders(<Tabs value="schedule" items={items} />)
    expect(screen.getByRole('tab', { name: 'Schedule' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Schedule content')).toBeVisible()
  })
})
