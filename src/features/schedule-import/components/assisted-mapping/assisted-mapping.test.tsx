import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  FIXTURE_DIVERTED_JOB_ID,
  seedDivertedImportJobStatusDTO,
} from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { AssistedMapping } from './assisted-mapping'

function renderMapping(jobId = FIXTURE_DIVERTED_JOB_ID) {
  return renderWithProviders(<AssistedMapping jobId={jobId} />, {
    store: makeStore(),
    route: `/imports/${jobId}/mapping`,
  })
}

describe('AssistedMapping', () => {
  it('is humble about the file instead of rendering a Gantt', async () => {
    renderMapping()

    expect(
      await screen.findByText(
        'Lennix could not turn ampliacion-bodega-logistica.xlsx into a schedule',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('schedule-canvas')).not.toBeInTheDocument()
  })

  it('shows what was read, from the report the job carries', async () => {
    renderMapping()

    // A diverted upload lands no draft, so the numbers travel on the job.
    expect(await screen.findByText('13 rows scanned')).toBeInTheDocument()
    expect(screen.getByText('9 rows read')).toBeInTheDocument()
    expect(screen.getByText('4 rows left out')).toBeInTheDocument()
  })

  it('translates the quality-floor reason into plain language', async () => {
    server.use(
      http.get('*/v1/schedule/import/jobs/:jobId', () => {
        const job = seedDivertedImportJobStatusDTO()
        return HttpResponse.json({
          ...job,
          quality: {
            resolution_ratio: 0.2,
            threshold: 0.6,
            reasons: ['low_resolution'],
            detail: 'Only a fifth of the rows landed.',
          },
        })
      }),
    )
    renderMapping()

    expect(
      await screen.findByText(
        'Too few rows resolved into tasks (20% of 60% needed).',
      ),
    ).toBeInTheDocument()
  })

  it('quotes the rows it could not place', async () => {
    renderMapping()

    expect(
      await screen.findByText('Row 17: “TOTAL GENERAL”'),
    ).toBeInTheDocument()
  })

  it('says manual mapping is not built yet rather than faking it', async () => {
    renderMapping()

    expect(
      await screen.findByText('Manual column mapping is coming'),
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Import another file' }),
    )
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
      '/projects/import',
    )
  })

  it('handles a job that no longer exists', async () => {
    server.use(
      http.get('*/v1/schedule/import/jobs/:jobId', () =>
        HttpResponse.json({ detail: 'Import job not found' }, { status: 404 }),
      ),
    )
    renderMapping()

    expect(
      await screen.findByText('This import could not be found'),
    ).toBeInTheDocument()
  })
})
