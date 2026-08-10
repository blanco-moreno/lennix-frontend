import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'

import { ImportDropzone, MAX_UPLOAD_BYTES } from './import-dropzone'

function xlsxFile(name = 'programa.xlsx', size = 2048) {
  const file = new File(['x'], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('ImportDropzone', () => {
  it('accepts a schedule with one interaction', async () => {
    const onFileSelected = vi.fn()
    renderWithProviders(
      <ImportDropzone
        file={null}
        onFileSelected={onFileSelected}
        onFileCleared={vi.fn()}
      />,
    )

    await userEvent.upload(screen.getByLabelText('Choose file'), xlsxFile())

    await waitFor(() => expect(onFileSelected).toHaveBeenCalledTimes(1))
    expect(onFileSelected.mock.calls[0][0].name).toBe('programa.xlsx')
  })

  it('states the formats it reads, including macro-enabled workbooks', () => {
    renderWithProviders(
      <ImportDropzone
        file={null}
        onFileSelected={vi.fn()}
        onFileCleared={vi.fn()}
      />,
    )

    expect(
      screen.getByText('.xlsx, .xlsm or .csv · up to 20 MB'),
    ).toBeInTheDocument()
  })

  it('rejects a file over the backend cap before uploading it', async () => {
    const onFileSelected = vi.fn()
    renderWithProviders(
      <ImportDropzone
        file={null}
        onFileSelected={onFileSelected}
        onFileCleared={vi.fn()}
      />,
    )

    await userEvent.upload(
      screen.getByLabelText('Choose file'),
      xlsxFile('huge.xlsx', MAX_UPLOAD_BYTES + 1),
    )

    expect(
      await screen.findByText('That file is over the 20 MB limit.'),
    ).toBeInTheDocument()
    expect(onFileSelected).not.toHaveBeenCalled()
  })

  it('shows the chosen file and lets it be removed', async () => {
    const onFileCleared = vi.fn()
    renderWithProviders(
      <ImportDropzone
        file={xlsxFile('carta-gantt.xlsx', 4096)}
        onFileSelected={vi.fn()}
        onFileCleared={onFileCleared}
      />,
    )

    expect(screen.getByText('carta-gantt.xlsx')).toBeInTheDocument()
    expect(screen.getByText('4.0 KB')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Remove file' }))
    expect(onFileCleared).toHaveBeenCalled()
  })
})
