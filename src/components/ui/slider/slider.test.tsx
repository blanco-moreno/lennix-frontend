import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { renderWithProviders } from '@/tests/render-with-providers'

import { Slider } from './slider'

// jsdom cannot measure the thumb, so zag keeps it `visibility: hidden` — the
// role queries must opt in to hidden elements.
const thumbs = () => screen.getAllByRole('slider', { hidden: true })

// The slider takes one label per thumb, as an array — spread so jsx-a11y does
// not misread the array literal as an invalid aria-label string.
const oneLabel = { 'aria-label': ['Amount'] }
const twoLabels = { 'aria-label': ['From', 'To'] }

describe('Slider', () => {
  it('renders a single thumb when no value is given', () => {
    renderWithProviders(<Slider {...oneLabel} />)
    expect(thumbs()).toHaveLength(1)
  })

  it('renders one thumb per value for a range', () => {
    renderWithProviders(<Slider {...twoLabels} value={[20, 80]} />)
    expect(thumbs()).toHaveLength(2)
  })

  it('reflects its value and bounds to assistive tech', () => {
    renderWithProviders(<Slider {...oneLabel} value={[30]} min={0} max={50} />)
    const [thumb] = thumbs()
    expect(thumb).toHaveAttribute('aria-valuenow', '30')
    expect(thumb).toHaveAttribute('aria-valuemin', '0')
    expect(thumb).toHaveAttribute('aria-valuemax', '50')
  })

  it('emits the new value array on keyboard interaction', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithProviders(
      <Slider
        {...oneLabel}
        defaultValue={[10]}
        onValueChange={onValueChange}
      />,
    )
    const [thumb] = thumbs()
    thumb.focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledWith([11])
  })
})
