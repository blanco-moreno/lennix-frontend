import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/render-with-providers'

import enMessages from '../../../../lang/en.json'

import { useFormatApiError } from './use-format-api-error'

/**
 * Feeds the formatter the `code` field the RTK Query error interceptor pulls
 * out of backend error bodies (`err.data.code`), plus the shapes that carry
 * no usable code at all.
 */
function Harness({ code }: { code: string | undefined }) {
  const formatApiError = useFormatApiError()
  return <span data-testid="formatted">{formatApiError(code)}</span>
}

describe('useFormatApiError', () => {
  it('translates a backend error code the catalog knows', () => {
    renderWithProviders(<Harness code="forbidden" />)

    expect(screen.getByTestId('formatted')).toHaveTextContent(
      enMessages['apiError.forbidden'],
    )
  })

  it('falls back to the generic message for a code the catalog does not map', () => {
    renderWithProviders(<Harness code="quota_exceeded_v9" />)

    expect(screen.getByTestId('formatted')).toHaveTextContent(
      enMessages['apiError.unknown'],
    )
  })

  it('falls back to the generic message when the error carried no code', () => {
    renderWithProviders(<Harness code={undefined} />)

    expect(screen.getByTestId('formatted')).toHaveTextContent(
      enMessages['apiError.unknown'],
    )
  })
})
