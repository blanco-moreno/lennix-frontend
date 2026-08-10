import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { forceStartMessages } from '@/features/force-start'
import { renderWithProviders } from '@/tests/render-with-providers'

import { commonMessages } from '../../common-messages'

import { ModalFormFooter } from './modal-form-footer'

describe('ModalFormFooter', () => {
  it('renders the default cancel copy and the submit label when idle', () => {
    renderWithProviders(
      <ModalFormFooter
        submitLabel={commonMessages.save}
        isLoading={false}
        onCancel={vi.fn()}
      />,
    )

    const cancel = screen.getByRole('button', { name: 'Cancel' })
    const submit = screen.getByRole('button', { name: 'Save' })
    expect(cancel).toHaveAttribute('type', 'button')
    expect(cancel).toBeEnabled()
    expect(submit).toHaveAttribute('type', 'submit')
    expect(submit).toBeEnabled()
  })

  it('disables both buttons and shows the saving copy while loading', () => {
    renderWithProviders(
      <ModalFormFooter
        submitLabel={commonMessages.save}
        isLoading={true}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Save' }),
    ).not.toBeInTheDocument()
  })

  it('disables only the submit button via submitDisabled', () => {
    renderWithProviders(
      <ModalFormFooter
        submitLabel={commonMessages.save}
        isLoading={false}
        submitDisabled
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderWithProviders(
      <ModalFormFooter
        submitLabel={commonMessages.save}
        isLoading={false}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('honours cancelLabel and savingLabel overrides', () => {
    renderWithProviders(
      <ModalFormFooter
        cancelLabel={commonMessages.actions}
        savingLabel={forceStartMessages.confirmLoading}
        submitLabel={commonMessages.save}
        isLoading={true}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeInTheDocument()
  })
})
