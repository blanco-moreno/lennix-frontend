/**
 * Route smoke: `/drafts` renders Borradores. The drafts home itself is pinned
 * in `src/views/drafts-view/drafts-view.test.tsx`.
 */

import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { DraftsView } from './drafts-view'

describe('DraftsView', () => {
  it('renders the drafts home on its route', async () => {
    renderWithProviders(<DraftsView />, {
      store: makeStore(),
      route: PATHS.DRAFTS,
    })

    expect(
      await screen.findByTestId('plan-usage-meter-drafts'),
    ).toBeInTheDocument()
  })
})
