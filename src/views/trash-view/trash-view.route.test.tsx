/**
 * Route smoke: `/trash` renders the papelera. Its behaviour is pinned in
 * `src/views/trash-view/trash-view.test.tsx`; the mock set carries no trash
 * handlers, so the three list endpoints are answered locally.
 */

import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { PATHS } from '@/constants'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { TrashView } from './trash-view'

/** The paginated envelope the three list endpoints return. */
const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  page_size: 20,
  total_pages: 0,
}

describe('TrashView', () => {
  it('renders the papelera on its route', async () => {
    server.use(
      http.get('*/v1/trash/projects', () => HttpResponse.json(EMPTY_PAGE)),
      http.get('*/v1/trash/tasks', () => HttpResponse.json(EMPTY_PAGE)),
      http.get('*/v1/trash/expenses', () => HttpResponse.json(EMPTY_PAGE)),
    )

    renderWithProviders(<TrashView />, {
      store: makeStore(),
      route: PATHS.TRASH,
    })

    expect(
      await screen.findByText(/Soft-deleted projects, activities and expenses/),
    ).toBeInTheDocument()
  })
})
