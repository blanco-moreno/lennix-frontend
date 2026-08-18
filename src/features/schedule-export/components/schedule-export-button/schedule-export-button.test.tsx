/**
 * The button owns the request: a workbook is handed to the browser under the
 * backend's filename, a refusal becomes a translated toast, and the control
 * is disabled while the file is being produced.
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_PROJECTS } from '@/tests/seed'
import * as utils from '@/utils'

import { ScheduleExportButton } from './schedule-export-button'

const XLSX_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function serveExport(status: 200 | 503, wait = 0) {
  server.use(
    http.post('*/v1/projects/*/export', async () => {
      if (wait) await delay(wait)
      if (status === 503) {
        return HttpResponse.json(
          { detail: { code: 'export_unavailable', message: 'nope' } },
          { status: 503 },
        )
      }
      // Bytes rather than a Blob: jsdom's Blob has no `stream()` for the
      // mocked Response to read.
      return HttpResponse.arrayBuffer(new TextEncoder().encode('PK').buffer, {
        headers: {
          'Content-Type': XLSX_TYPE,
          'Content-Disposition': 'attachment; filename="Torre-Norte.xlsx"',
        },
      })
    }),
  )
}

function renderButton() {
  const project = SEED_PROJECTS.find((candidate) => !candidate.isDraft)!
  renderWithProviders(<ScheduleExportButton projectId={project.id} />, {
    store: makeStore(),
  })
  return screen.getByTestId('schedule-export-button')
}

describe('ScheduleExportButton', () => {
  const download = vi.spyOn(utils, 'downloadBlob').mockImplementation(() => {})
  const errorToast = vi.spyOn(toast, 'error')

  beforeEach(() => {
    download.mockClear()
    errorToast.mockClear()
  })

  it('downloads the workbook under the name the backend gave it', async () => {
    serveExport(200)
    await userEvent.click(renderButton())

    await waitFor(() => expect(download).toHaveBeenCalledTimes(1))
    const [blob, filename] = download.mock.calls[0]
    // Duck-typed: the fetch polyfill's Blob is not jsdom's `Blob` class.
    expect(blob.size).toBe(2)
    expect(blob.type).toBe(XLSX_TYPE)
    expect(filename).toBe('Torre-Norte.xlsx')
    expect(errorToast).not.toHaveBeenCalled()
  })

  it('is disabled while exporting', async () => {
    serveExport(200, 200)
    const button = renderButton()
    await userEvent.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Exporting…')
    await waitFor(() => expect(button).not.toBeDisabled())
  })

  it('shows a translated toast on a refusal and downloads nothing', async () => {
    serveExport(503)
    await userEvent.click(renderButton())

    await waitFor(() => expect(errorToast).toHaveBeenCalledTimes(1))
    expect(errorToast.mock.calls[0][0]).toMatch(/could not be exported/i)
    expect(download).not.toHaveBeenCalled()
  })
})
