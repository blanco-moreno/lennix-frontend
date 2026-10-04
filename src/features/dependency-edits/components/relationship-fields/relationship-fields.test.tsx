import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'

import { RelationshipFields } from './relationship-fields'

describe('RelationshipFields', () => {
  it('holds a lag past the bound to the bound, and shows it once the field is left', async () => {
    const user = userEvent.setup()
    const onLagChange = vi.fn()
    renderWithProviders(
      <RelationshipFields
        type="FS"
        onTypeChange={vi.fn()}
        onLagChange={onLagChange}
      />,
    )

    const lag = screen.getByLabelText('Lag (days; negative starts earlier)')
    await user.clear(lag)
    await user.type(lag, '-4000')
    expect(onLagChange).toHaveBeenLastCalledWith(-365)

    // What the link will carry is what the field says, not what was typed.
    await user.tab()
    expect(lag).toHaveValue(-365)
  })

  it('reports the type picked and says the chosen one in words', async () => {
    const user = userEvent.setup()
    const onTypeChange = vi.fn()
    renderWithProviders(
      <RelationshipFields
        type="SS"
        onTypeChange={onTypeChange}
        onLagChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /^SS —/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('starts when the other starts')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^FF —/ }))
    expect(onTypeChange).toHaveBeenCalledWith('FF')
  })
})
