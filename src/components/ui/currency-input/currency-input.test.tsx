import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { CurrencyInput } from './currency-input'

describe('CurrencyInput', () => {
  it('formats a numeric-string value with grouping and two decimals', () => {
    renderWithProviders(
      <CurrencyInput
        aria-label="Budget"
        value="1500000"
        onValueChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Budget' })).toHaveValue(
      '1,500,000.00',
    )
  })

  it('shows the currency symbol for the locale', () => {
    renderWithProviders(
      <CurrencyInput aria-label="Budget" value="" onValueChange={vi.fn()} />,
    )
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('parses typed input back to a raw value and a number', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(
      <CurrencyInput
        aria-label="Amount"
        value=""
        onValueChange={onValueChange}
      />,
    )
    await user.type(screen.getByRole('textbox', { name: 'Amount' }), '1234.5')
    // fixedDecimalScale pads the raw value to two decimals.
    expect(onValueChange).toHaveBeenLastCalledWith({
      value: '1234.50',
      valueAsNumber: 1234.5,
    })
  })

  it('rejects values below the minimum (no negatives by default)', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(
      <CurrencyInput
        aria-label="Amount"
        value=""
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Amount' })
    await user.type(input, '-5')
    // The minus sign is not allowed, so only the "5" lands.
    expect(onValueChange).toHaveBeenLastCalledWith({
      value: '5.00',
      valueAsNumber: 5,
    })
  })

  it('shows an empty field for an undefined value', () => {
    renderWithProviders(
      <CurrencyInput
        aria-label="Amount"
        value={undefined}
        onValueChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('')
  })
})
