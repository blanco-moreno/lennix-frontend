import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { buildNarration } from './narration'
import { NarrationReceipt } from './narration-receipt'

const narration = () =>
  buildNarration(mapScheduleReviewStateDTO(seedImportReviewStateDTO()))

describe('NarrationReceipt', () => {
  it('names the file and the sheet it was read from', () => {
    renderWithProviders(<NarrationReceipt narration={narration()} />)

    expect(
      screen.getByText('Read from ampliacion-bodega-logistica.xlsx'),
    ).toBeInTheDocument()
    expect(screen.getByText('sheet “CARTA GANTT”')).toBeInTheDocument()
  })

  it('quotes the phase names verbatim from the file', () => {
    const receipt = narration()
    renderWithProviders(<NarrationReceipt narration={receipt} />)

    // Uppercase Spanish section names, exactly as the workbook writes them.
    const quoted = receipt.phaseNames.map((name) => `“${name}”`).join(' · ')
    expect(screen.getByText(quoted)).toBeInTheDocument()
    expect(quoted).toContain('“OBRAS PRELIMINARES”')
  })

  it('states the caveat count as a checkable number', () => {
    const receipt = narration()
    renderWithProviders(<NarrationReceipt narration={receipt} />)

    // The seeded parse commits one high-consequence assumption, bins one row
    // and drops four — three causes, three things to check.
    expect(receipt.caveatCount).toBe(3)
    expect(
      screen.getByRole('button', {
        name: `${receipt.caveatCount} things to check`,
      }),
    ).toBeInTheDocument()
  })

  it('says so plainly when there is nothing to check', () => {
    renderWithProviders(
      <NarrationReceipt
        narration={{ ...narration(), caveats: [], caveatCount: 0 }}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'nothing to check' }),
    ).toBeInTheDocument()
  })

  it('makes every number a way into the detail', async () => {
    const onFocus = vi.fn()
    renderWithProviders(
      <NarrationReceipt narration={narration()} onFocus={onFocus} />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: /^\d+ activities$/ }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: /things to check/ }),
    )

    expect(onFocus).toHaveBeenNthCalledWith(1, 'activities')
    expect(onFocus).toHaveBeenNthCalledWith(2, 'caveats')
  })

  it('marks the active number as pressed', () => {
    renderWithProviders(
      <NarrationReceipt narration={narration()} activeFocus="caveats" />,
    )

    expect(
      screen.getByRole('button', { name: /things to check/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('mentions the rows a returning user already adjusted', () => {
    renderWithProviders(
      <NarrationReceipt narration={{ ...narration(), editedCount: 2 }} />,
    )

    expect(screen.getByText(/2 rows you already adjusted/)).toBeInTheDocument()
  })

  it('reports the levels the 2-level model flattened, counting the phase', () => {
    // The seed nests one row a level deeper than the model holds: the file has
    // three levels, not the two the backend's offset reports.
    const receipt = narration()
    expect(receipt.collapsedRows).toBe(1)

    renderWithProviders(<NarrationReceipt narration={receipt} />)

    expect(screen.getByTestId('collapsed-rows-notice').textContent).toMatch(
      /nested 3 levels deep.*1 activity was flattened/,
    )
  })

  it('stays quiet when the file fit the model', () => {
    renderWithProviders(
      <NarrationReceipt narration={{ ...narration(), collapsedRows: 0 }} />,
    )

    expect(screen.queryByTestId('collapsed-rows-notice')).toBeNull()
  })
})
