import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { Modal } from './modal'

describe('Modal (classic)', () => {
  it('renders nothing while closed', () => {
    renderWithProviders(
      <Modal open={false} onOpenChange={vi.fn()} title="Hidden">
        <p>Invisible body</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Invisible body')).not.toBeInTheDocument()
  })

  it('renders title, description, body and footer when open', async () => {
    renderWithProviders(
      <Modal
        open
        onOpenChange={vi.fn()}
        title="Edit task"
        description="Change the fields and save"
        footer={<button type="button">Save changes</button>}
      >
        <p>Form body</p>
      </Modal>,
    )
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName('Edit task')
    expect(dialog).toHaveAccessibleDescription('Change the fields and save')
    expect(screen.getByText('Form body')).toBeInTheDocument()
    // The footer contract: whatever the caller passes renders as-is.
    expect(
      screen.getByRole('button', { name: 'Save changes' }),
    ).toBeInTheDocument()
  })

  it('closes through the close button', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderWithProviders(
      <Modal open onOpenChange={onOpenChange} title="Closable">
        <p>Body</p>
      </Modal>,
    )
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('wraps the content in a form when onSubmit is given and submits through the footer', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    renderWithProviders(
      <Modal
        open
        onOpenChange={vi.fn()}
        title="Create project"
        onSubmit={onSubmit}
        footer={<button type="submit">Create</button>}
      >
        <input aria-label="Name" />
      </Modal>,
    )
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('Modal (confirmation)', () => {
  function renderConfirmation(
    overrides: Partial<React.ComponentProps<typeof Modal>> = {},
  ) {
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()
    renderWithProviders(
      <Modal
        variant="confirmation"
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Delete project"
        description="This cannot be undone"
        {...overrides}
      />,
    )
    return { onOpenChange, onConfirm }
  }

  it('renders the default confirm and cancel labels', async () => {
    renderConfirmation()
    await screen.findByRole('dialog')
    expect(
      screen.getByRole('button', { name: 'Confirmar' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('confirms and closes on the confirm button', async () => {
    const user = userEvent.setup()
    const { onOpenChange, onConfirm } = renderConfirmation({
      confirmLabel: 'Delete',
    })
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('cancels without confirming', async () => {
    const user = userEvent.setup()
    const { onOpenChange, onConfirm } = renderConfirmation({
      cancelLabel: 'Keep it',
    })
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Keep it' }))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables both actions while confirming', async () => {
    renderConfirmation({ isConfirming: true })
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })

  it('disables only the confirm action via confirmDisabled', async () => {
    renderConfirmation({ confirmDisabled: true })
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled()
  })

  it('renders extra body content above the actions', async () => {
    renderConfirmation({
      children: <p>The 12 tasks below will also be deleted</p>,
    })
    await screen.findByRole('dialog')
    expect(
      screen.getByText('The 12 tasks below will also be deleted'),
    ).toBeInTheDocument()
  })
})
