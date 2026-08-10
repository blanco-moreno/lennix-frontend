import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'

import { ReceiptNumber } from '.'

describe('ReceiptNumber', () => {
  it('hands its focus token up when clicked', async () => {
    const onFocus = vi.fn()
    renderWithProviders(
      <ReceiptNumber
        label="12 activities"
        focus="activities"
        isActive={false}
        onFocus={onFocus}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: '12 activities' }))

    expect(onFocus).toHaveBeenCalledWith('activities')
  })

  it('marks whether it is the active number via aria-pressed', () => {
    const { unmount } = renderWithProviders(
      <ReceiptNumber label="3 phases" focus="phases" isActive />,
    )
    expect(screen.getByRole('button', { name: '3 phases' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    unmount()

    renderWithProviders(
      <ReceiptNumber label="3 phases" focus="phases" isActive={false} />,
    )
    expect(screen.getByRole('button', { name: '3 phases' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('survives a click with no focus handler wired', async () => {
    renderWithProviders(
      <ReceiptNumber
        label="nothing to check"
        focus="caveats"
        isActive={false}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'nothing to check' }),
    )

    expect(
      screen.getByRole('button', { name: 'nothing to check' }),
    ).toBeInTheDocument()
  })
})
