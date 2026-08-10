import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import toast from 'react-hot-toast'

import { renderWithProviders } from '@/tests/render-with-providers'

import { MemberCredentialsDialog } from './member-credentials-dialog'

const credentials = {
  email: 'nueva.persona@lennix-test.com',
  password: 'Temp-Passw0rd!',
}

describe('MemberCredentialsDialog', () => {
  it('stays closed while there are no credentials to show', () => {
    renderWithProviders(
      <MemberCredentialsDialog credentials={null} onClose={vi.fn()} />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the one-time credentials and closes via Done', async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <MemberCredentialsDialog credentials={credentials} onClose={onClose} />,
    )

    const dialog = await screen.findByRole('dialog')
    // The whole point of the dialog: the password exists nowhere else.
    expect(within(dialog).getByText(credentials.email)).toBeInTheDocument()
    expect(within(dialog).getByText(credentials.password)).toBeInTheDocument()

    await userEvent.click(within(dialog).getByRole('button', { name: 'Done' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('copies both credentials to the clipboard', async () => {
    // userEvent installs a working clipboard stub in jsdom.
    const user = userEvent.setup()
    const successToast = vi.spyOn(toast, 'success')
    renderWithProviders(
      <MemberCredentialsDialog credentials={credentials} onClose={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: /copy credentials/i }))

    await waitFor(() => expect(successToast).toHaveBeenCalled())
    const copied = await window.navigator.clipboard.readText()
    expect(copied).toContain(credentials.email)
    expect(copied).toContain(credentials.password)
  })
})
