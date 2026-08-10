import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Trash2 } from 'lucide-react'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { DropdownMenu, type DropdownMenuItemSpec } from './dropdown-menu'

function renderMenu(items: DropdownMenuItemSpec[]) {
  return renderWithProviders(
    <DropdownMenu
      trigger={<button type="button">Actions</button>}
      items={items}
    />,
  )
}

describe('DropdownMenu', () => {
  it('opens on trigger click and lists the items', async () => {
    const user = userEvent.setup()
    renderMenu([{ label: 'Edit' }, { label: 'Delete', icon: Trash2 }])

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
  })

  it('fires onSelect when an item is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderMenu([{ label: 'Edit', onSelect }])

    await user.click(screen.getByRole('button', { name: 'Actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('renders separators between item groups', async () => {
    const user = userEvent.setup()
    renderMenu([{ label: 'Edit' }, { type: 'separator' }, { label: 'Delete' }])

    await user.click(screen.getByRole('button', { name: 'Actions' }))
    await screen.findByRole('menu')
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('does not fire onSelect for a disabled item', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderMenu([{ label: 'Delete', disabled: true, onSelect }])

    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const item = await screen.findByRole('menuitem', { name: 'Delete' })
    expect(item).toHaveAttribute('aria-disabled', 'true')
    await user.click(item)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
