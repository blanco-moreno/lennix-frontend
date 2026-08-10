import { screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'

import { renderWithProviders } from '@/tests/render-with-providers'

import { ExpenseFields, type ExpenseFieldValues } from './expense-fields'

function Harness({ withPlaceholders }: { withPlaceholders?: boolean }) {
  const {
    control,
    register,
    formState: { errors },
  } = useForm<ExpenseFieldValues>({
    defaultValues: {
      description: '',
      amount: '',
      category: '',
      expenseDate: '',
    },
  })
  return (
    <ExpenseFields
      control={control}
      register={register}
      errors={errors}
      idPrefix="expense-test"
      withPlaceholders={withPlaceholders}
    />
  )
}

describe('ExpenseFields', () => {
  it('renders the four fields with prefixed ids and no placeholders by default', () => {
    renderWithProviders(<Harness />)

    const description = screen.getByLabelText('Description')
    expect(description).toHaveAttribute('id', 'expense-test-description')
    expect(description).not.toHaveAttribute('placeholder')
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
  })

  it('shows the description and category placeholders when asked', () => {
    renderWithProviders(<Harness withPlaceholders />)

    expect(
      screen.getByPlaceholderText('Expense description'),
    ).toBeInTheDocument()
    expect(screen.getByText('Select category')).toBeInTheDocument()
  })
})
