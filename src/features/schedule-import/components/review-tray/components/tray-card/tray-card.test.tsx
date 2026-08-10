import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import { TrayCard } from '.'

describe('TrayCard', () => {
  it('states the question, its context and holds exactly one mechanism', () => {
    renderWithProviders(
      <TrayCard
        kind="unclassified_row"
        blocking={false}
        title="Lennix could not place “TOTAL GENERAL”"
        body="Place it under a phase"
        meta="Sheet CARTA GANTT, row 17"
      >
        <button type="button">Place</button>
      </TrayCard>,
    )

    const card = screen.getByTestId('tray-card')
    expect(card).toHaveAttribute('data-exception-kind', 'unclassified_row')
    expect(card).toHaveAttribute('data-blocking', 'false')
    expect(card).toHaveTextContent('Sheet CARTA GANTT, row 17')
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('marks a blocking question as such', () => {
    renderWithProviders(
      <TrayCard
        kind="unclassified_row"
        blocking
        title="“RADIER” has no activities under it"
        body="A phase is tracked through its activities."
      >
        <span />
      </TrayCard>,
    )

    expect(screen.getByTestId('tray-card')).toHaveAttribute(
      'data-blocking',
      'true',
    )
  })
})
