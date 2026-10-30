import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import toast from 'react-hot-toast'
import { defineMessages } from 'react-intl'
import { describe, expect, it, vi } from 'vitest'

import { taskBudgetSchema, taskValidationMessages } from '@/schemas'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { BudgetForm } from './budget-form'

// A stand-in consumer's message set — BudgetForm is reusable and takes any
// caller-supplied descriptors, so the test doesn't reach into a real caller.
const messages = defineMessages({
  title: { id: 'test.budgetModalTitle', defaultMessage: 'Update budget' },
  description: {
    id: 'test.budgetModalDescription',
    defaultMessage: 'Enter the new budget for this main activity.',
  },
  fieldLabel: { id: 'test.budgetFieldLabel', defaultMessage: 'Budget (USD)' },
  submit: { id: 'test.update', defaultMessage: 'Update' },
  updateSuccess: {
    id: 'test.taskBudgetUpdateSuccess',
    defaultMessage: 'Budget updated',
  },
  updateError: {
    id: 'test.taskBudgetUpdateError',
    defaultMessage: 'Could not update the budget',
  },
})

function renderModal({
  currentBudget = 50000 as number | null,
  onSubmit = vi.fn().mockResolvedValue(undefined),
  onOpenChange = vi.fn(),
  isLoading = false,
} = {}) {
  renderWithProviders(
    <BudgetForm
      inputId="budget-form-input"
      currentBudget={currentBudget}
      open
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      schema={taskBudgetSchema}
      validationMessages={taskValidationMessages}
      messages={messages}
      onSubmit={onSubmit}
    />,
    { store: makeStore() },
  )
  return { onSubmit, onOpenChange }
}

describe('BudgetForm', () => {
  it('renders the title, description and labelled amount field', async () => {
    renderModal()

    expect(screen.getByText('Update budget')).toBeInTheDocument()
    expect(
      screen.getByText('Enter the new budget for this main activity.'),
    ).toBeInTheDocument()
    expect(await screen.findByLabelText('Budget (USD)')).toHaveValue(
      '50,000.00',
    )
  })

  it('submits the typed amount serialized to two decimals and closes', async () => {
    const { onSubmit, onOpenChange } = renderModal()
    const successToast = vi.spyOn(toast, 'success')

    const input = await screen.findByLabelText('Budget (USD)')
    await userEvent.clear(input)
    await userEvent.type(input, '75500')
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('75500.00'))
    expect(successToast).toHaveBeenCalledWith(
      'Budget updated',
      expect.anything(),
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
    successToast.mockRestore()
  })

  it('surfaces the API error message and stays open on failure', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue({ message: 'Budget locked by approval' })
    const { onOpenChange } = renderModal({ onSubmit })
    const errorToast = vi.spyOn(toast, 'error')

    await screen.findByLabelText('Budget (USD)')
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith(
        'Budget locked by approval',
        expect.anything(),
      ),
    )
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    errorToast.mockRestore()
  })

  it('falls back to the generic error copy when the failure has no message', async () => {
    const onSubmit = vi.fn().mockRejectedValue({})
    renderModal({ onSubmit })
    const errorToast = vi.spyOn(toast, 'error')

    await screen.findByLabelText('Budget (USD)')
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith(
        'Could not update the budget',
        expect.anything(),
      ),
    )
    errorToast.mockRestore()
  })

  it('disables both footer buttons while loading', async () => {
    renderModal({ isLoading: true })

    expect(
      await screen.findByRole('button', { name: 'Saving...' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })
})
