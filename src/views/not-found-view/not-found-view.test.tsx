import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PATHS } from '@/constants'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { NotFoundView } from './not-found-view'

function renderNotFound() {
  return renderWithProviders(<NotFoundView />, { route: '/no-such-page' })
}

describe('NotFoundView', () => {
  it('says the page does not exist', () => {
    renderNotFound()

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('sends the user back home', async () => {
    renderNotFound()

    await userEvent.click(screen.getByRole('button', { name: 'Back to home' }))

    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
      new RegExp(`^${PATHS.HOME}$`),
    )
  })
})
