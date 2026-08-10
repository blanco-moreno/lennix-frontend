/**
 * The portfolio list, mounted directly.
 *
 * The at-risk lens is a query parameter, and nothing here narrows a fetched
 * page: `tasks.filter(isAtRiskTask)` over the arrived page under a paginator
 * reporting the unfiltered total is a KPI saying "12 at risk" over a
 * drill-through showing 1 of 68 pages.
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedOrganizationTaskListDTO } from '@/tests/fixtures'
import {
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ListTabContent } from './list-tab-content'

const orgTasks = seedOrganizationTaskListDTO()

function renderList(route = '/tasks') {
  return renderWithProviders(<ListTabContent />, { store: makeStore(), route })
}

/** Records the query string of every `GET /v1/tasks/` the surface issues. */
function captureTaskQueries() {
  const queries: URLSearchParams[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (url.pathname.endsWith('/v1/tasks/')) {
      queries.push(url.searchParams)
    }
  })
  return queries
}

async function queryWith(queries: URLSearchParams[], name: string) {
  await waitFor(() => {
    expect(queries.some((q) => q.has(name))).toBe(true)
  })
  return queries.filter((q) => q.has(name)).at(-1) as URLSearchParams
}

function taskRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 't-1',
    project_id: SEED_IDS.PROJECT_TORRE_ID,
    project_name: 'Torre Residencial Norte',
    parent_id: null,
    title: 'Cimentacion',
    description: null,
    status: 'in_progress',
    priority: 'high',
    progress: 20,
    budget: '0.00',
    spent: '0.00',
    is_over_budget: false,
    is_critical_path: false,
    is_blocked: false,
    is_draft: false,
    force_started: false,
    at_risk: false,
    start_date: null,
    due_date: null,
    delay_days: 0,
    delay_reason: null,
    location: null,
    assignee_id: null,
    assignee_name: null,
    created_at: '2026-01-01T00:00:00Z',
    subtasks: [],
    ...overrides,
  }
}

function stubTasks(items: ReturnType<typeof taskRow>[], total = items.length) {
  server.use(
    http.get('*/v1/tasks/', () =>
      HttpResponse.json({
        items,
        total,
        page: 1,
        page_size: 5,
        total_pages: Math.max(1, Math.ceil(total / 5)),
      }),
    ),
  )
}

describe('ListTabContent — the page it renders is the page it asked for', () => {
  it('renders the seeded portfolio page with its paginator total', async () => {
    renderList()

    expect(
      (await screen.findAllByText(orgTasks[0].title)).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(new RegExp(`of ${orgTasks.length}`)),
    ).toBeInTheDocument()
  })

  it('sends the at-risk lens to the server instead of filtering the page', async () => {
    const queries = captureTaskQueries()
    // The response deliberately contains a row that is NOT at risk. A surface
    // that re-filtered what arrived would drop it; the honest surface renders
    // the server's answer as it came, because the server was asked the
    // question. This is the assertion the whole lens rests on.
    stubTasks([
      taskRow({ id: 't-1', title: 'Cimentacion', delay_days: 6 }),
      taskRow({ id: 't-2', title: 'Acabados' }),
    ])

    renderList('/tasks?risk=at_risk')

    expect(await screen.findByText('Cimentacion')).toBeInTheDocument()
    expect(screen.getByText('Acabados')).toBeInTheDocument()
    expect((await queryWith(queries, 'risk')).get('risk')).toBe('at_risk')
  })

  it('narrows to the delayed or blocked rows, because the server answered it', async () => {
    // Against the real handler — which applies `delay_days > 0 OR is_blocked`,
    // the backend's own predicate — the lens is a genuine narrowing and the
    // total below it counts the same population.
    renderList('/tasks?risk=at_risk')

    const atRisk = orgTasks.filter((t) => t.delay_days > 0 || t.is_blocked)
    expect(atRisk.length).toBeGreaterThan(0)
    expect(atRisk.length).toBeLessThan(orgTasks.length)
    expect(
      await screen.findByText(new RegExp(`of ${atRisk.length}`)),
    ).toBeInTheDocument()
  })

  it('combines two filters, and both reach the request', async () => {
    const queries = captureTaskQueries()
    renderList('/tasks?risk=at_risk&priority=high&blocked=true')

    const q = await queryWith(queries, 'priority')
    expect(q.get('risk')).toBe('at_risk')
    expect(q.get('priority')).toBe('high')
    expect(q.get('is_blocked')).toBe('true')
  })

  it('sends the sort key, so the order is the whole set’s order', async () => {
    const queries = captureTaskQueries()
    renderList('/tasks?sort=-delay_days')

    expect((await queryWith(queries, 'sort_by')).get('sort_by')).toBe(
      '-delay_days',
    )
  })

  it('survives a remount, because the state is the address', async () => {
    const queries = captureTaskQueries()
    const route = '/tasks?risk=at_risk&priority=high&page=2'
    const { unmount } = renderList(route)
    await queryWith(queries, 'priority')

    unmount()
    queries.length = 0
    renderList(route)

    const q = await queryWith(queries, 'priority')
    expect(q.get('risk')).toBe('at_risk')
    expect(q.get('page')).toBe('2')
  })

  it('returns to page 1 when a filter changes on page 3', async () => {
    const user = userEvent.setup()
    stubTasks([taskRow()], 40)
    const queries = captureTaskQueries()
    renderList('/tasks?page=3')

    await screen.findByText('Cimentacion')
    await user.type(
      screen.getByPlaceholderText(/search main activities/i),
      'Pilotes',
    )

    const q = await queryWith(queries, 'search')
    expect(q.get('search')).toBe('Pilotes')
    expect(q.get('page')).toBe('1')
  })
})

describe('ListTabContent — the chips say what is on', () => {
  it('names the lens the KPI arrived with, and drops only it', async () => {
    const user = userEvent.setup()
    renderList('/tasks?risk=at_risk&priority=high')

    await user.click(
      await screen.findByRole('button', { name: /Remove filter: Risk/i }),
    )

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).not.toHaveTextContent('risk=')
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      'priority=high',
    )
  })
})
