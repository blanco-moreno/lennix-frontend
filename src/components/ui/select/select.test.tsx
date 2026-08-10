import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { Select } from './select'

const options = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'done', label: 'Done', disabled: true },
]

describe('Select', () => {
  it('shows the label of the selected value', () => {
    renderWithProviders(<Select id="status" value="paused" options={options} />)
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })

  it('shows the placeholder when nothing is selected', () => {
    renderWithProviders(
      <Select id="status" options={options} placeholder="Pick a status" />,
    )
    expect(screen.getByText('Pick a status')).toBeInTheDocument()
  })

  it('opens on click and reports the picked value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <Select id="status" options={options} onChange={onChange} />,
    )
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('Paused'))
    expect(onChange).toHaveBeenCalledWith('paused')
  })

  it('marks a disabled option as not selectable', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <Select id="status" options={options} onChange={onChange} />,
    )
    await user.click(screen.getByRole('combobox'))
    const done = await screen.findByText('Done')
    await user.click(done)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables its input while disabled', () => {
    renderWithProviders(<Select id="status" options={options} disabled />)
    // The disabled control never opens, so no option is in the document.
    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(screen.queryByText('Active')).not.toBeInTheDocument()
  })
})
