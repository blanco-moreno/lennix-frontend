import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ScheduleReviewState } from '@/types'

import { NarrationReceipt } from './narration-receipt'

const state = (): ScheduleReviewState =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO())

describe('NarrationReceipt', () => {
  it('names the file and the sheet, with no narrator', () => {
    renderWithProviders(<NarrationReceipt state={state()} />)

    expect(
      screen.getByRole('heading', { name: 'ampliacion-bodega-logistica.xlsx' }),
    ).toBeInTheDocument()
    expect(screen.getByText('sheet “CARTA GANTT”')).toBeInTheDocument()
    expect(screen.queryByText(/Lennix/)).not.toBeInTheDocument()
  })

  it('states the draft’s facts with the shared line', () => {
    renderWithProviders(<NarrationReceipt state={state()} />)

    expect(screen.getByTestId('schedule-facts')).toBeInTheDocument()
  })

  it('quotes the phase names verbatim from the file', () => {
    renderWithProviders(<NarrationReceipt state={state()} />)

    expect(screen.getByText(/“OBRAS PRELIMINARES”/)).toBeInTheDocument()
  })

  it('folds how the file was read, rows left out included', async () => {
    renderWithProviders(<NarrationReceipt state={state()} />)

    expect(
      screen.queryByTestId('receipt-interpretation'),
    ).not.toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'How the file was read' }),
    )

    expect(screen.getByTestId('receipt-interpretation')).toHaveTextContent(
      /left out/,
    )
  })

  it('mentions the rows a returning user already edited', () => {
    const review = state()
    review.stats = { ...review.stats, editedTasks: 2 }
    renderWithProviders(<NarrationReceipt state={review} />)

    expect(screen.getByText(/2 activities edited/)).toBeInTheDocument()
  })

  it('reports the levels the 2-level model flattened, counting the phase', () => {
    // The seed nests one row a level deeper than the model holds: the file has
    // three levels, not the two the backend's offset reports.
    renderWithProviders(<NarrationReceipt state={state()} />)

    expect(screen.getByTestId('collapsed-rows-notice').textContent).toMatch(
      /1 subactivity came from 3 levels/,
    )
  })

  it('stays quiet when the file fit the model', () => {
    const review = state()
    review.stats = { ...review.stats, collapsedRows: 0 }
    renderWithProviders(<NarrationReceipt state={review} />)

    expect(screen.queryByTestId('collapsed-rows-notice')).toBeNull()
  })
})
