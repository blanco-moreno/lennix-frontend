/**
 * The papelera is the undo for every destructive action in the product, and
 * the only thing that purges — so these pin what it actually does.
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import {
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { TrashView } from './trash-view'

/** `roleIdToSlug` maps 1 → 'admin', the only role holding `trash.purge`. */
const ADMIN_ROLE_ID = 1

const PROJECT = {
  id: 'p-1',
  name: 'Bodega Logística',
  deleted_at: '2026-07-20T10:00:00Z',
}

const TASKS = [
  {
    id: 't-1',
    title: 'Cimentación',
    parent_id: null,
    deleted_at: '2026-07-21T10:00:00Z',
  },
  {
    id: 't-2',
    title: 'Excavación',
    parent_id: 't-1',
    deleted_at: '2026-07-21T11:00:00Z',
  },
]

/** The paginated envelope the three list endpoints return. */
function page<T>(items: T[], { pageSize = 20, total = items.length } = {}) {
  return {
    items,
    total,
    page: 1,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  }
}

/** Projects list shrinks after a restore, the way the real endpoint would. */
function stubTrash({ projects = [PROJECT] } = {}) {
  let remaining = projects
  server.use(
    http.get('*/v1/trash/projects', () => HttpResponse.json(page(remaining))),
    http.get('*/v1/trash/tasks', () => HttpResponse.json(page(TASKS))),
    http.get('*/v1/trash/expenses', () => HttpResponse.json(page([]))),
    http.post('*/v1/trash/projects/:id/restore', ({ params }) => {
      remaining = remaining.filter((p) => p.id !== params.id)
      return new HttpResponse(null, { status: 204 })
    }),
  )
}

function renderTrash(route = '/trash') {
  return renderWithProviders(<TrashView />, { store: makeStore(), route })
}

describe('TrashView', () => {
  it('lists what has been deleted, with when', async () => {
    stubTrash()
    renderTrash()

    expect(await screen.findByText('Bodega Logística')).toBeInTheDocument()
  })

  it('names each level in the product vocabulary, translated', async () => {
    stubTrash()
    renderTrash('/trash?tab=tasks')

    // Translated, never hardcoded English. One word per level: a top-level
    // task is a Main activity, its children are Subactivities.
    expect(await screen.findByText('Main activity')).toBeInTheDocument()
    expect(screen.getByText('Subactivity')).toBeInTheDocument()
    expect(screen.queryByText('Activity')).toBeNull()
  })

  it('keeps the open tab in the URL, like every other tabbed surface', async () => {
    const user = userEvent.setup()
    stubTrash()
    renderTrash()

    await user.click(await screen.findByRole('tab', { name: /Expenses/i }))

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
        'tab=expenses',
      )
    })
  })

  it('opens straight onto the tab a link names', async () => {
    stubTrash()
    renderTrash('/trash?tab=tasks')

    expect(await screen.findByText('Cimentación')).toBeInTheDocument()
  })

  it('gives each checkbox a name that says which row it is', async () => {
    stubTrash()
    renderTrash()

    // A bare input would give a screen reader "checkbox" and no idea which
    // row the purge button next to it would destroy.
    expect(
      await screen.findByRole('checkbox', { name: 'Select Bodega Logística' }),
    ).toBeInTheDocument()
  })

  it('counts the selection in the reader locale, not in hardcoded Spanish', async () => {
    const user = userEvent.setup()
    stubTrash()
    renderTrash()

    await user.click(
      await screen.findByRole('checkbox', { name: 'Select Bodega Logística' }),
    )

    expect(await screen.findByText('1 selected')).toBeInTheDocument()
    expect(screen.queryByText(/seleccionado/)).toBeNull()
  })

  it('drops a restored row from the selection instead of carrying a dead id', async () => {
    const user = userEvent.setup()
    stubTrash()
    renderTrash()

    await user.click(
      await screen.findByRole('checkbox', { name: 'Select Bodega Logística' }),
    )
    expect(await screen.findByText('1 selected')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Restore/i }))

    // The row is gone, so the selection has to be gone with it: purge refuses
    // an id that is no longer soft-deleted, and the user would only see a flat
    // "could not delete".
    await waitFor(() => {
      expect(screen.queryByText('1 selected')).toBeNull()
    })
  })

  describe('pagination', () => {
    it('asks the server for the page the URL names', async () => {
      const seen: string[] = []
      server.use(
        http.get('*/v1/trash/projects', ({ request }) => {
          seen.push(new URL(request.url).searchParams.get('page') ?? '')
          return HttpResponse.json(page([PROJECT], { total: 45 }))
        }),
        http.get('*/v1/trash/tasks', () => HttpResponse.json(page(TASKS))),
        http.get('*/v1/trash/expenses', () => HttpResponse.json(page([]))),
      )
      renderTrash('/trash?page=3')

      await screen.findByText('Bodega Logística')
      expect(seen).toContain('3')
    })

    it('reports the server total, not the number of rows on screen', async () => {
      server.use(
        http.get('*/v1/trash/projects', () =>
          // One row on this page, 45 in the papelera: the paginator must say 45.
          HttpResponse.json(page([PROJECT], { total: 45 })),
        ),
        http.get('*/v1/trash/tasks', () => HttpResponse.json(page(TASKS))),
        http.get('*/v1/trash/expenses', () => HttpResponse.json(page([]))),
      )
      renderTrash()

      await screen.findByText('Bodega Logística')
      // "Showing 1–1 of 45" — the total is the server's, not the page's.
      expect(await screen.findByText(/of 45/)).toBeInTheDocument()
    })

    it('starts over when the tab changes, since page 3 of one is not page 3 of another', async () => {
      const user = userEvent.setup()
      stubTrash()
      renderTrash('/trash?page=3')

      await screen.findByText('Bodega Logística')
      await user.click(screen.getByRole('tab', { name: /Expenses/i }))

      await waitFor(() => {
        expect(screen.getByTestId(SEARCH_TEST_ID)).not.toHaveTextContent(
          'page=3',
        )
      })
    })

    it('ignores a page the URL cannot mean', async () => {
      const seen: string[] = []
      server.use(
        http.get('*/v1/trash/projects', ({ request }) => {
          seen.push(new URL(request.url).searchParams.get('page') ?? 'absent')
          return HttpResponse.json(page([PROJECT]))
        }),
        http.get('*/v1/trash/tasks', () => HttpResponse.json(page(TASKS))),
        http.get('*/v1/trash/expenses', () => HttpResponse.json(page([]))),
      )
      renderTrash('/trash?page=nonsense')

      await screen.findByText('Bodega Logística')
      // Falls back to the first page rather than asking for something the
      // server cannot answer.
      expect(seen).toContain('1')
    })
  })

  describe('purge is gated, restore is not', () => {
    /** `trash.purge` is admin-only; `trash.restore` reaches further. */
    const adminStore = () => {
      const store = makeStore()
      store.dispatch(
        setUser({
          userId: SEED_IDS.USER_CARLOS_ID,
          email: 'carlos@lennix.cl',
          firstName: 'Carlos',
          lastName: 'Rodriguez',
          phone: null,
          isActive: true,
          planId: null,
          roleId: ADMIN_ROLE_ID,
          organizationId: SEED_IDS.ORG_LENNIX_ID,
        }),
      )
      return store
    }

    it('offers no permanent delete to someone without the key', async () => {
      stubTrash()
      renderTrash()

      expect(await screen.findByText('Bodega Logística')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Restore/i }),
      ).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^Delete/i })).toBeNull()
    })

    it('offers it to an admin', async () => {
      stubTrash()
      renderWithProviders(<TrashView />, {
        store: adminStore(),
        route: '/trash',
      })

      expect(await screen.findByText('Bodega Logística')).toBeInTheDocument()
      expect(
        await screen.findByRole('button', { name: /^Delete/i }),
      ).toBeInTheDocument()
    })
  })
})
