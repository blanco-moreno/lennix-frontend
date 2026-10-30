import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { CurrencySelect } from './currency-select'

describe('CurrencySelect', () => {
  it('names the selected currency with its ISO code', () => {
    renderWithProviders(
      <CurrencySelect id="currency" value="CLP" onChange={vi.fn()} />,
    )

    expect(screen.getByText('Chilean peso (CLP)')).toBeInTheDocument()
  })

  it('reports the picked ISO code', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <CurrencySelect id="currency" value="CLP" onChange={onChange} />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('US dollar (USD)'))

    expect(onChange).toHaveBeenCalledWith('USD')
  })
})
