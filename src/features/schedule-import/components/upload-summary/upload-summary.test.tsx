import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PATHS } from '@/constants'
import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { UploadSummary } from './upload-summary'

const state = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

describe('UploadSummary', () => {
  it('reports the file the draft was read from', () => {
    const { scheduleImport, report } = state()
    renderWithProviders(
      <UploadSummary scheduleImport={scheduleImport} report={report} />,
      { route: '/drafts/x/review?step=upload' },
    )

    expect(
      screen.getByText('ampliacion-bodega-logistica.xlsx'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `${report.rowsImported} imported of ${report.rowsScanned} scanned · ${report.rowsDropped} dropped`,
      ),
    ).toBeInTheDocument()
  })

  it('offers no dropzone: a second file is a new draft, not a second upload', async () => {
    renderWithProviders(
      <UploadSummary
        scheduleImport={state().scheduleImport}
        report={state().report}
      />,
      { route: '/drafts/x/review?step=upload' },
    )

    expect(screen.queryByTestId('import-dropzone')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Import another file' }),
    )
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
      PATHS.PROJECT_IMPORT,
    )
  })

  it('says so when the draft carries no import record', () => {
    renderWithProviders(
      <UploadSummary scheduleImport={null} report={state().report} />,
      { route: '/drafts/x/review?step=upload' },
    )

    expect(
      screen.getByText('No file recorded for this draft'),
    ).toBeInTheDocument()
  })
})
