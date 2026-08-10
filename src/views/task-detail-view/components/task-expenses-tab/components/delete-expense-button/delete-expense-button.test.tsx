import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'

import { DeleteExpenseButton } from './delete-expense-button'

function renderButton({
  isDeleting = false,
  onConfirm = () => {},
}: { isDeleting?: boolean; onConfirm?: () => void } = {}) {
  return renderWithProviders(
    <DeleteExpenseButton
      isDeleting={isDeleting}
      name="Alquiler excavadora"
      onConfirm={onConfirm}
    />,
  )
}

describe('DeleteExpenseButton', () => {
  it('asks for confirmation naming the expense, then confirms', async () => {
    const onConfirm = vi.fn()
    renderButton({ onConfirm })

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText(
        'Are you sure you want to delete "Alquiler excavadora"? This action cannot be undone.',
      ),
    ).toBeInTheDocument()

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Delete' }),
    )
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancelling never deletes', async () => {
    const onConfirm = vi.fn()
    renderButton({ onConfirm })

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    )

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('disables itself while the delete is in flight', () => {
    renderButton({ isDeleting: true })

    expect(screen.getByRole('button', { name: 'Deleting…' })).toBeDisabled()
  })
})
