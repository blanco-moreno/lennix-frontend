import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { FormDrawer } from './drawer'

describe('FormDrawer', () => {
  it('renders nothing while closed', () => {
    renderWithProviders(
      <FormDrawer open={false} onOpenChange={vi.fn()} title="Hidden">
        <p>Invisible body</p>
      </FormDrawer>,
    )
    expect(screen.queryByText('Invisible body')).not.toBeInTheDocument()
  })

  it('renders title, description, body and footer when open', async () => {
    renderWithProviders(
      <FormDrawer
        open
        onOpenChange={vi.fn()}
        title="Edit project"
        description="Change the fields and save"
        footer={<button type="button">Save changes</button>}
      >
        <p>Form body</p>
      </FormDrawer>,
    )
    const drawer = await screen.findByRole('dialog')
    expect(drawer).toHaveAccessibleName('Edit project')
    expect(drawer).toHaveAccessibleDescription('Change the fields and save')
    expect(screen.getByText('Form body')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Save changes' }),
    ).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const onOpenChange = vi.fn()
    renderWithProviders(
      <FormDrawer open onOpenChange={onOpenChange} title="Edit project">
        <p>Form body</p>
      </FormDrawer>,
    )
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('submits the form when a submit handler is given', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    renderWithProviders(
      <FormDrawer
        open
        onOpenChange={vi.fn()}
        title="Edit project"
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      >
        <p>Form body</p>
      </FormDrawer>,
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
