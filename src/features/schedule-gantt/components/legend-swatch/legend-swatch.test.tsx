import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { LegendSwatch } from '.'

/** The generated declarations behind the swatch box's emotion class. */
function swatchCss(label: string): string {
  const swatch = screen.getByText(label)
    .previousElementSibling as HTMLElement | null
  const styled = Array.from(swatch?.classList ?? []).find((name) =>
    name.startsWith('css-'),
  )
  expect(styled).toBeDefined()

  const css = Array.from(document.querySelectorAll('style'))
    .map((sheet) => sheet.textContent ?? '')
    .join('')
  return css.split(`.${styled}{`)[1]?.split('}')[0] ?? ''
}

describe('LegendSwatch', () => {
  it('paints a solid swatch in the colour it stands for', () => {
    renderWithProviders(<LegendSwatch color="#dc2626" label="Critical path" />)

    expect(screen.getByText('Critical path')).toBeInTheDocument()
    expect(swatchCss('Critical path')).toContain('#dc2626')
  })

  it('draws a dashed outline instead of a fill for a dashed entry', () => {
    renderWithProviders(
      <LegendSwatch color="#dc2626" label="Broken link" dashed />,
    )

    const css = swatchCss('Broken link')
    expect(css).toContain('border-style:dashed')
    expect(css).toContain('transparent')
  })

  it('carries the bar hatch into the legend, so the cue is not hue alone', () => {
    renderWithProviders(
      <LegendSwatch color="#dc2626" label="Critical path" hatched />,
    )

    expect(swatchCss('Critical path')).toContain(
      'repeating-linear-gradient(45deg',
    )
  })
})
