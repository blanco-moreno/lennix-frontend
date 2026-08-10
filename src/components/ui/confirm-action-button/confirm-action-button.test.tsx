import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { ConfirmActionButton } from './confirm-action-button'

function renderButton(
  props: Partial<Parameters<typeof ConfirmActionButton>[0]> = {},
) {
  const onConfirm = vi.fn()
  renderWithProviders(
    <ConfirmActionButton
      title="Remove member"
      description="This cannot be undone."
      cancelLabel="Cancel"
      confirmLabel="Remove"
      onConfirm={onConfirm}
      {...props}
    />,
  )
  return { onConfirm }
}

describe('ConfirmActionButton', () => {
  it('confirms through the modal before firing the action', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderButton()

    await user.click(screen.getByRole('button'))
    expect(onConfirm).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancelling closes without firing the action', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderButton()

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('a disabled trigger opens nothing', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderButton({ disabled: true })

    await user.click(screen.getByRole('button'))
    expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
