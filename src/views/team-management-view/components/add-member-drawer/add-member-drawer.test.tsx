import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { AddMemberDrawer } from './add-member-drawer'

/** The modal is controlled; the harness plays the owning view's part. */
function Harness({
  onCreate,
}: {
  onCreate: (data: unknown) => Promise<boolean>
}) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button onClick={() => setOpen(true)}>reopen</button>
      <AddMemberDrawer
        open={open}
        isSubmitting={false}
        onOpenChange={setOpen}
        onCreate={onCreate}
      />
    </>
  )
}

function renderModal(onCreate = vi.fn().mockResolvedValue(true)) {
  renderWithProviders(<Harness onCreate={onCreate} />)
  return onCreate
}

async function fillForm(dialog: HTMLElement) {
  await userEvent.type(within(dialog).getByLabelText('First name'), 'Nueva')
  await userEvent.type(within(dialog).getByLabelText('Last name'), 'Persona')
  await userEvent.type(
    within(dialog).getByLabelText('Email address'),
    'nueva.persona@lennix-test.com',
  )
}

const createButton = () => screen.getByRole('button', { name: /create/i })

describe('AddMemberDrawer', () => {
  it('keeps Create disabled until the form is valid, then submits the values', async () => {
    const onCreate = renderModal()
    const dialog = await screen.findByRole('dialog')

    expect(createButton()).toBeDisabled()

    await fillForm(dialog)
    // A malformed email keeps the gate shut even with every field filled.
    const emailInput = within(dialog).getByLabelText('Email address')
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'not-an-email')
    await waitFor(() => expect(createButton()).toBeDisabled())
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'nueva.persona@lennix-test.com')

    await waitFor(() => expect(createButton()).toBeEnabled())
    await userEvent.click(createButton())

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1))
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Nueva',
        lastName: 'Persona',
        email: 'nueva.persona@lennix-test.com',
      }),
    )
  })

  it('resets the form after a successful create', async () => {
    renderModal(vi.fn().mockResolvedValue(true))
    const dialog = await screen.findByRole('dialog')

    await fillForm(dialog)
    await userEvent.click(createButton())

    // The next add starts blank, not with the previous teammate's data.
    await waitFor(() => {
      expect(within(dialog).getByLabelText('First name')).toHaveValue('')
    })
    expect(within(dialog).getByLabelText('Email address')).toHaveValue('')
  })

  it('keeps the typed values when the create fails, so the admin can retry', async () => {
    renderModal(vi.fn().mockResolvedValue(false))
    const dialog = await screen.findByRole('dialog')

    await fillForm(dialog)
    await userEvent.click(createButton())

    await waitFor(() =>
      expect(within(dialog).getByLabelText('First name')).toHaveValue('Nueva'),
    )
    expect(within(dialog).getByLabelText('Email address')).toHaveValue(
      'nueva.persona@lennix-test.com',
    )
  })

  it('discards a half-typed form when the modal is cancelled and reopened', async () => {
    renderModal()
    let dialog = await screen.findByRole('dialog')

    await fillForm(dialog)
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'reopen' }))

    dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByLabelText('First name')).toHaveValue('')
  })
})
