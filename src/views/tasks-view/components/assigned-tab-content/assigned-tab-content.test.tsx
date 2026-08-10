/**
 * The "assigned to me" queue, mounted directly. The endpoint contract (caller
 * from the token, shared filters, tab-in-URL) is pinned through the whole
 * surface in ../../assigned-tab.test.tsx; what is colocated here is the queue
 * rendered from the seed and its empty state.
 */

import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedAssignedSubtaskListDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { AssignedTabContent } from './assigned-tab-content'

/** The demo login's own queue — the seed guarantees every demo user carries work. */
const queue = seedAssignedSubtaskListDTO()

function renderQueue() {
  return renderWithProviders(<AssignedTabContent />, {
    store: makeStore(),
    route: '/tasks?tab=assigned',
  })
}

describe('AssignedTabContent', () => {
  it('renders the seeded queue with where each row came from', async () => {
    expect(queue.length).toBeGreaterThan(0)
    renderQueue()

    expect((await screen.findAllByText(queue[0].title)).length).toBeGreaterThan(
      0,
    )
    expect(screen.getAllByText(queue[0].project_name).length).toBeGreaterThan(0)
    // The paginator's range — the total is the server's count, in the toolbar.
    expect(
      screen.getByText(new RegExp(`of ${queue.length}`)),
    ).toBeInTheDocument()
  })

  it('says so when nothing is assigned, instead of an empty page', async () => {
    server.use(
      http.get('*/v1/tasks/assigned', () =>
        HttpResponse.json({
          items: [],
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 0,
        }),
      ),
    )
    renderQueue()

    expect(
      await screen.findByText('Nothing assigned to you'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Activities appear here when someone assigns one to you, at either level. Check the filters if you were expecting something.',
      ),
    ).toBeInTheDocument()
  })
})
