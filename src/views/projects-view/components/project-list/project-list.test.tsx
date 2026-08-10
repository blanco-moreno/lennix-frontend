/**
 * The list answers the question it is asked, and the question lives in the URL.
 *
 * Two rules these pin. Filtering the fetched page while the paginator reports
 * the server's totals answers "no projects" for a project on page 3. And
 * filters live in the URL, not Redux, so a filtered listing can be pasted into
 * a message and survives a reload.
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { ProjectList } from './project-list'

function renderProjectList(route = '/projects') {
  return renderWithProviders(<ProjectList />, { store: makeStore(), route })
}

/** Records the query string of every `GET /v1/projects` the surface issues. */
function captureProjectQueries() {
  const queries: URLSearchParams[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (url.pathname.endsWith('/v1/projects')) {
      queries.push(url.searchParams)
    }
  })
  return queries
}

/** The first query that carried `name`, once one has. */
async function queryWith(queries: URLSearchParams[], name: string) {
  await waitFor(() => {
    expect(queries.some((q) => q.has(name))).toBe(true)
  })
  return queries.filter((q) => q.has(name)).at(-1) as URLSearchParams
}

const oneProject = {
  id: 'p-torre',
  organization_id: 'org-1',
  name: 'Torre Residencial Norte',
  description: null,
  location: null,
  status: 'on_track',
  priority: 'medium',
  budget: '1000.00',
  manager_id: null,
  manager_name: null,
  is_draft: false,
  progress: 0,
  start_date: null,
  due_date: null,
  allocated: '0.00',
  spent: '0.00',
  is_over_budget: false,
  created_at: '2026-01-01T00:00:00Z',
  health: { level: 'on_track', delay_days: 0, days_overdue: 0 },
}

/** One project across five pages — the shape a page-reset defect needs. */
function stubFivePages() {
  server.use(
    http.get('*/v1/projects', () =>
      HttpResponse.json({
        items: [oneProject],
        total: 5,
        page: 1,
        page_size: 1,
        total_pages: 5,
      }),
    ),
  )
}

describe('ProjectList — the first-use empty state', () => {
  it('says the organization has none at all, and offers the import', async () => {
    server.use(
      http.get('*/v1/projects', () =>
        HttpResponse.json({
          items: [],
          total: 0,
          page: 1,
          page_size: 5,
          total_pages: 0,
        }),
      ),
    )

    renderProjectList()

    expect(
      await screen.findByText('Import a schedule to create the first one.'),
    ).toBeInTheDocument()
  })
})

describe('ProjectList — the server owns the query', () => {
  it('sends every filter the URL carries, translated to the wire names', async () => {
    const queries = captureProjectQueries()
    renderProjectList(
      '/projects?status=delayed&priority=high&over_budget=true&due_before=2026-12-31&sort=-priority&page_size=10',
    )

    const q = await queryWith(queries, 'priority')
    expect(q.get('status')).toBe('delayed')
    expect(q.get('priority')).toBe('high')
    expect(q.get('is_over_budget')).toBe('true')
    expect(q.get('due_before')).toBe('2026-12-31')
    expect(q.get('sort_by')).toBe('-priority')
    expect(q.get('page_size')).toBe('10')
  })

  it('asks the person filter for the obras that person leads', async () => {
    // One URL word, two wire names: the person a row belongs to is its
    // manager here and its assignee on /tasks.
    const queries = captureProjectQueries()
    renderProjectList('/projects?assignee=u-1')

    const q = await queryWith(queries, 'manager_id')
    expect(q.get('manager_id')).toBe('u-1')
    expect(q.has('assignee_id')).toBe(false)
  })

  it('sorts on the server, never over the page that arrived', async () => {
    const queries = captureProjectQueries()
    renderProjectList('/projects?sort=name')

    const q = await queryWith(queries, 'sort_by')
    expect(q.get('sort_by')).toBe('name')
  })

  it('survives a remount, because the state is the address', async () => {
    const queries = captureProjectQueries()
    const route = '/projects?status=delayed&priority=high&page=2'
    const { unmount } = renderProjectList(route)
    await queryWith(queries, 'priority')

    unmount()
    queries.length = 0
    renderProjectList(route)

    // A reload carries nothing over: whatever the second mount asks for came
    // out of the URL alone.
    const q = await queryWith(queries, 'priority')
    expect(q.get('status')).toBe('delayed')
    expect(q.get('page')).toBe('2')
  })

  it('omits an empty search and an unset select rather than sending them', async () => {
    const queries = captureProjectQueries()
    renderProjectList()

    await waitFor(() => expect(queries.length).toBeGreaterThan(0))
    queries.forEach((q) => {
      expect(q.has('search')).toBe(false)
      expect(q.has('status')).toBe(false)
      expect(q.has('priority')).toBe(false)
    })
  })

  it('finds a match that is not on the first page', async () => {
    // A client-side filter would see only page 1 and render the empty state
    // over a `total` of 5 — the search must go to the server.
    server.use(
      http.get('*/v1/projects', ({ request }) => {
        const search = new URL(request.url).searchParams.get('search')
        if (search !== 'Bodega') {
          return HttpResponse.json({
            items: [],
            total: 5,
            page: 1,
            page_size: 1,
            total_pages: 5,
          })
        }
        return HttpResponse.json({
          items: [{ ...oneProject, id: 'p-bodega', name: 'Bodega Central' }],
          total: 1,
          page: 1,
          page_size: 1,
          total_pages: 1,
        })
      }),
    )

    renderProjectList('/projects?search=Bodega')

    expect(await screen.findByText('Bodega Central')).toBeInTheDocument()
  })

  it('says a search found nothing, over the same empty page', async () => {
    // Against the real handler: the term matches no obra in the seed, so the
    // page is empty *because of the filter* — and the copy has to say that
    // rather than "no projects yet", which would be a lie about the org.
    renderProjectList('/projects?search=zzzzz')

    // The empty state only appears once `/me` and the search have both landed,
    // so the wait is two round trips deep — longer than the one second
    // `findBy*` allows by default on a loaded machine.
    expect(
      await screen.findByText(
        'No projects match the selected filters.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()
  })
})

describe('ProjectList — the page follows the filter', () => {
  it('returns to page 1 when a filter changes on page 3', async () => {
    const user = userEvent.setup()
    stubFivePages()
    const queries = captureProjectQueries()
    renderProjectList('/projects?page=3')

    await screen.findByText('Torre Residencial Norte')
    await user.type(screen.getByPlaceholderText(/search projects/i), 'Bodega')

    // A narrower result has fewer pages; keeping the page number would render
    // an empty grid over a non-zero total.
    const q = await queryWith(queries, 'search')
    expect(q.get('search')).toBe('Bodega')
    expect(q.get('page')).toBe('1')
  })

  it('keeps the page in the URL, so a paged listing can be shared', async () => {
    const user = userEvent.setup()
    stubFivePages()
    renderProjectList()

    await screen.findByText('Torre Residencial Norte')
    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent('page=2')
    })
  })
})

describe('ProjectList — the chips say what is on', () => {
  it('shows one chip per active filter', async () => {
    renderProjectList('/projects?status=delayed&priority=high')

    expect(
      await screen.findByRole('button', { name: /Remove filter: Status/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Remove filter: Priority/i }),
    ).toBeInTheDocument()
  })

  it('drops exactly the filter whose chip was clicked', async () => {
    const user = userEvent.setup()
    renderProjectList('/projects?status=delayed&priority=high')

    await user.click(
      await screen.findByRole('button', { name: /Remove filter: Priority/i }),
    )

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).not.toHaveTextContent(
        'priority=',
      )
    })
    // The other one stays put — that is the whole difference from "clear all".
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      'status=delayed',
    )
    expect(
      screen.getByRole('button', { name: /Remove filter: Status/i }),
    ).toBeInTheDocument()
  })

  it('clears every filter at once from the reset', async () => {
    const user = userEvent.setup()
    renderProjectList('/projects?status=delayed&priority=high')

    await user.click(
      await screen.findByRole('button', { name: /clear filters/i }),
    )

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).not.toHaveTextContent(
        'status=',
      )
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).not.toHaveTextContent(
      'priority=',
    )
  })
})

describe('ProjectList — a typed word costs one request', () => {
  it('clears back to the unfiltered list rather than leaving the last term on screen', async () => {
    // Two different answers, so "which one is rendered" is observable: the
    // stale-query trap is an emptied box still showing the matches for the term
    // that was deleted.
    server.use(
      http.get('*/v1/projects', ({ request }) => {
        const matched =
          new URL(request.url).searchParams.get('search') === 'Bodega'
        return HttpResponse.json({
          items: [
            {
              ...oneProject,
              id: matched ? 'p-bodega' : 'p-torre',
              name: matched ? 'Bodega Central' : 'Torre Residencial Norte',
            },
          ],
          total: 1,
          page: 1,
          page_size: 5,
          total_pages: 1,
        })
      }),
    )

    const user = userEvent.setup()
    renderProjectList()

    await screen.findByText('Torre Residencial Norte')
    const box = screen.getByPlaceholderText(/search projects/i)

    await user.type(box, 'Bodega')
    expect(await screen.findByText('Bodega Central')).toBeInTheDocument()

    await user.clear(box)

    expect(box).toHaveValue('')
    expect(
      await screen.findByText('Torre Residencial Norte'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Bodega Central')).not.toBeInTheDocument()
  })
})
