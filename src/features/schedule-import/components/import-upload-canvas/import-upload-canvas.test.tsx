import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  FIXTURE_DIVERTED_JOB_ID,
  seedImportAssistedMappingErrorDTO,
  seedImportUploadDTO,
} from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { ImportUploadCanvas } from './import-upload-canvas'

function scheduleFile(name = 'programa.xlsx') {
  return new File(['x'], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function renderCanvas() {
  return renderWithProviders(<ImportUploadCanvas />, {
    store: makeStore(),
    route: '/projects/import',
  })
}

/** The upload only fires once the org id is known (`GET /v1/auth/me`). */
async function uploadFile() {
  const input = await screen.findByLabelText('Choose file')
  await userEvent.upload(input, scheduleFile())
}

describe('ImportUploadCanvas', () => {
  it('lands the user on their schedule, with no wizard in between', async () => {
    renderCanvas()
    await uploadFile()

    await waitFor(() =>
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        `/drafts/${seedImportUploadDTO().project_id}/review`,
      ),
    )
    // No step indicator, no "next": the file is the only input.
    expect(screen.queryByText(/Step/i)).not.toBeInTheDocument()
  })

  it('diverts a file below the quality floor to assisted mapping', async () => {
    server.use(
      http.post('*/v1/schedule/import', () =>
        HttpResponse.json(
          { detail: seedImportAssistedMappingErrorDTO() },
          { status: 422 },
        ),
      ),
    )
    renderCanvas()
    await uploadFile()

    await waitFor(() =>
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        `/imports/${FIXTURE_DIVERTED_JOB_ID}/mapping`,
      ),
    )
  })

  it('is honest about a file it cannot read at all', async () => {
    server.use(
      http.post('*/v1/schedule/import', () =>
        HttpResponse.json(
          {
            detail: {
              code: 'needs_normalization',
              import_job_id: FIXTURE_DIVERTED_JOB_ID,
              message: 'We could not read this schedule automatically.',
            },
          },
          { status: 422 },
        ),
      ),
    )
    renderCanvas()
    await uploadFile()

    expect(
      await screen.findByText('Lennix could not read this file'),
    ).toBeInTheDocument()
    // Nothing was imported, and the user is not stranded.
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
      '/projects/import',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Try another file' }),
    )
    expect(
      screen.queryByText('Lennix could not read this file'),
    ).not.toBeInTheDocument()
  })

  it.each([
    {
      code: 'invalid_file_signature',
      title: 'This file is not what its extension says',
    },
    {
      code: 'unsupported_file_type',
      title: 'This file type cannot be imported',
    },
    {
      code: 'prompt_injection_detected',
      title: 'This file was not processed',
    },
  ])(
    'names a $code refusal instead of a generic read failure',
    async ({ code, title }) => {
      server.use(
        http.post('*/v1/schedule/import', () =>
          HttpResponse.json(
            {
              detail: {
                code,
                import_job_id: FIXTURE_DIVERTED_JOB_ID,
                message: 'refused',
              },
            },
            { status: 422 },
          ),
        ),
      )
      renderCanvas()
      await uploadFile()

      expect(await screen.findByText(title)).toBeInTheDocument()
      expect(
        screen.queryByText('Lennix could not read this file'),
      ).not.toBeInTheDocument()
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        '/projects/import',
      )
    },
  )

  it('names the plan draft cap instead of failing generically', async () => {
    server.use(
      http.post('*/v1/schedule/import', () =>
        HttpResponse.json(
          {
            detail: {
              code: 'plan_draft_limit_exceeded',
              message: 'Plan limit exceeded: maximum 3 pending draft projects',
              limit: 3,
              current: 3,
            },
          },
          { status: 400 },
        ),
      ),
    )
    renderCanvas()
    await uploadFile()

    expect(
      await screen.findByText('You reached your plan limit: 3 pending drafts'),
    ).toBeInTheDocument()
  })
})
