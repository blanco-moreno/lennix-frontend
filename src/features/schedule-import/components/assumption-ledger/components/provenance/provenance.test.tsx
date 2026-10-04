import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { buildLedgerView, type LedgerCause } from '../../ledger-model'

import { Provenance } from '.'

const seededCause = (): LedgerCause =>
  buildLedgerView(mapScheduleReviewStateDTO(seedImportReviewStateDTO())).loud[0]

describe('Provenance', () => {
  it('renders nothing at all when a cause has no rows and no samples to show', () => {
    const { container } = renderWithProviders(
      <Provenance cause={{ ...seededCause(), provenance: [], samples: [] }} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('still names a source row that is no longer on the canvas, by its ref', async () => {
    renderWithProviders(
      <Provenance
        cause={{
          ...seededCause(),
          provenance: [{ ref: '42', title: null, sheet: null, row: null }],
          samples: [],
        }}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'See it in the file' }),
    )

    expect(screen.getByTestId('cause-provenance')).toHaveTextContent(
      'Row 42 of the file',
    )
  })

  it('closes the detail again on a second click', async () => {
    renderWithProviders(<Provenance cause={seededCause()} />)

    const toggle = screen.getByRole('button', {
      name: 'See it in the file',
    })
    await userEvent.click(toggle)
    expect(screen.getByTestId('cause-provenance')).toBeInTheDocument()

    await userEvent.click(toggle)
    expect(screen.queryByTestId('cause-provenance')).not.toBeInTheDocument()
  })
})
