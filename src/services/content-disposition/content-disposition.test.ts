import {
  FALLBACK_EXPORT_FILENAME,
  filenameFromContentDisposition,
} from './content-disposition'

describe('filenameFromContentDisposition', () => {
  it('reads the quoted filename the backend writes', () => {
    expect(
      filenameFromContentDisposition(
        'attachment; filename="Torre-Norte-fase-2.xlsx"',
      ),
    ).toBe('Torre-Norte-fase-2.xlsx')
  })

  it('reads a bare filename', () => {
    expect(
      filenameFromContentDisposition('attachment; filename=plan.xlsx'),
    ).toBe('plan.xlsx')
  })

  it('falls back when the header is missing or nameless', () => {
    expect(filenameFromContentDisposition(null)).toBe(FALLBACK_EXPORT_FILENAME)
    expect(filenameFromContentDisposition('attachment')).toBe(
      FALLBACK_EXPORT_FILENAME,
    )
  })
})
