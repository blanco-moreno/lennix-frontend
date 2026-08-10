import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ScheduleReviewState } from '@/types'

import { AssumptionLedger } from './assumption-ledger'

const state = (): ScheduleReviewState =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO())

function renderLedger(review = state()) {
  renderWithProviders(
    <AssumptionLedger projectId={review.project.id} state={review} />,
    { store: makeStore() },
  )
}

describe('AssumptionLedger', () => {
  it('states a high-consequence cause in full, however confident the parser was', () => {
    renderLedger()

    // The seeded column never contradicts the parser — every day is 12 or
    // lower — which is exactly the case that must be loud.
    // Composed from the contract's facts (cause + scope + chosen + count),
    // never printed from ms-ai's English prose.
    expect(
      screen.getByText(
        'I read the start dates as day/month/year. Affects 9 rows.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('The other reading: month/day/year'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('ledger-cause')).toHaveAttribute(
      'data-consequence',
      'high',
    )
  })

  it('renders one entry per cause, never one per cell', () => {
    renderLedger()

    expect(screen.getAllByTestId('ledger-cause')).toHaveLength(1)
    expect(screen.getAllByText(/Affects 9 rows/)).toHaveLength(1)
  })

  it('carries the one-flip reversal on the cause itself', () => {
    renderLedger()

    expect(screen.getByTestId('date-order-toggle')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Read it the other way' }),
    ).toBeInTheDocument()
  })

  it('answers “where did this come from?” with the user’s own file', async () => {
    renderLedger()

    expect(screen.queryByTestId('cause-provenance')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Where did this come from?' }),
    )

    const provenance = screen.getByTestId('cause-provenance')
    expect(provenance).toHaveTextContent(
      'OBRAS PRELIMINARES — sheet CARTA GANTT, row 8',
    )
    expect(provenance).toHaveTextContent(
      'Read from the file: 01-09-2026, 08-09-2026, 26-09-2026',
    )
  })

  it('keeps a cosmetic cause quiet, as a mark rather than a claim', () => {
    const review = state()
    renderLedger({
      ...review,
      ledger: [
        ...review.ledger,
        {
          cause: 'locale',
          scope: 'sheet',
          consequence: 'cosmetic',
          chosen: 'es',
          alternativeValue: null,
          alternativeAction: 'none',
          affectedRows: 12,
          sampleRowRefs: [],
          assumption: 'Read the file as Spanish.',
          alternative: null,
          detail: '',
        },
      ],
    })

    expect(screen.getAllByTestId('ledger-cause')).toHaveLength(1)
    expect(screen.getByTestId('ledger-quiet')).toHaveTextContent(
      'I read the file as being written in “es”. Affects 12 rows.',
    )
  })

  it('states what was left out instead of hiding it', () => {
    renderLedger()

    expect(screen.getByTestId('ledger-left-out')).toHaveTextContent(
      '4 rows were left out: empty rows; repeated headers; footer totals.',
    )
  })

  it('says nothing at all when there was nothing to decide', () => {
    const review = state()
    renderLedger({
      ...review,
      ledger: [],
      report: { ...review.report, rowsDropped: 0, dropped: [] },
    })

    expect(screen.queryByTestId('assumption-ledger')).not.toBeInTheDocument()
  })
})
