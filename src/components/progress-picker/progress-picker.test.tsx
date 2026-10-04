import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'

import { ProgressPicker } from './progress-picker'

describe('ProgressPicker', () => {
  it('reports the quick value picked', async () => {
    const onChange = vi.fn()
    renderWithProviders(<ProgressPicker value={40} onChange={onChange} />)

    expect(screen.getByText('Progress')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '75%' }))

    expect(onChange).toHaveBeenCalledWith(75)
  })

  it('offers the whole range when it has no floor', () => {
    renderWithProviders(<ProgressPicker value={60} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '0%' })).toBeEnabled()
    expect(screen.queryByText(/Minimum allowed progress/)).toBeNull()
  })

  it('disables what lies under its floor, and says why', () => {
    renderWithProviders(
      <ProgressPicker value={60} min={60} onChange={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: '25%' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '75%' })).toBeEnabled()
    expect(
      screen.getByText(/Minimum allowed progress is 60%/),
    ).toBeInTheDocument()
  })
})
