/**
 * The cross-project activity list answers the question it is asked.
 *
 * Filtering the 20 fetched rows client-side while the paginator reports the
 * organization's totals is, at the Pro plan's ten-project ceiling, a search
 * over 20 of ~500 activities.
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedProject } from '@/tests/fixtures'
import {
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { TasksView } from './tasks-view'

function renderTaskDashboard(route = '/tasks') {
  return renderWithProviders(<TasksView />, { store: makeStore(), route })
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

describe('TasksView — the server owns the query, the URL owns the state', () => {
  it('sends the filters the URL carries, translated to the wire names', async () => {
    const queries = captureTaskQueries()
    renderTaskDashboard(
      `/tasks?search=Cimentacion&status=in_progress&project=${SEED_IDS.PROJECT_TORRE_ID}&critical=true`,
    )

    const q = await queryWith(queries, 'search')
    expect(q.get('search')).toBe('Cimentacion')
    expect(q.get('status')).toBe('in_progress')
    expect(q.get('project_id')).toBe(SEED_IDS.PROJECT_TORRE_ID)
    expect(q.get('is_critical_path')).toBe('true')
  })

  it('omits what is unset rather than sending a sentinel', async () => {
    const queries = captureTaskQueries()
    renderTaskDashboard()

    await waitFor(() => expect(queries.length).toBeGreaterThan(0))
    queries.forEach((q) => {
      expect(q.has('search')).toBe(false)
      expect(q.has('status')).toBe(false)
      expect(q.has('project_id')).toBe(false)
      expect(q.has('priority')).toBe(false)
    })
  })

  it('renders every row the server returned, with no second pass over the page', async () => {
    // The response is the answer. A surface that re-filtered it would drop this
    // row, because its title does not contain the search term — the server
    // matched it on its description.
    server.use(
      http.get('*/v1/tasks/', () =>
        HttpResponse.json({
          items: [
            {
              id: 't-1',
              project_id: SEED_IDS.PROJECT_TORRE_ID,
              parent_id: null,
              title: 'Pilotes',
              description: 'Excavacion profunda',
              status: 'todo',
              priority: 'high',
              progress: 0,
              budget: '0.00',
              spent: '0.00',
              is_over_budget: false,
              is_critical_path: false,
              is_blocked: false,
              is_draft: false,
              force_started: false,
              start_date: null,
              due_date: null,
              delay_days: 0,
              delay_reason: null,
              location: null,
              assignee_id: null,
              assignee_name: null,
              created_at: '2026-01-01T00:00:00Z',
              subtasks: [],
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
          total_pages: 1,
        }),
      ),
    )

    renderTaskDashboard('/tasks?search=Excavacion')

    expect(await screen.findByText('Pilotes')).toBeInTheDocument()
  })

  it('counts the matches across the organization, not the rows on this page', async () => {
    server.use(
      http.get('*/v1/tasks/', () =>
        HttpResponse.json({
          items: [],
          total: 137,
          page: 1,
          page_size: 20,
          total_pages: 7,
        }),
      ),
    )

    renderTaskDashboard()

    // The paginator's range — the total is the server's count for this
    // filter, not the size of the page that arrived.
    expect(await screen.findByText(/of 137/)).toBeInTheDocument()
  })
})

describe('TasksView — the row names its own obra', () => {
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

  it('titles each group from the activities themselves', async () => {
    renderTaskDashboard()

    expect(
      await screen.findByText(seedProject(SEED_IDS.PROJECT_TORRE_ID).name),
    ).toBeInTheDocument()
  })

  it('never asks for the whole project list to do it', async () => {
    // Every row carries `projectName`, so no 100-row project lookup is needed
    // to turn a `project_id` into a name — the absence is the point.
    const projectQueries = captureProjectQueries()
    const taskQueries = captureTaskQueries()
    renderTaskDashboard()

    await waitFor(() => expect(taskQueries.length).toBeGreaterThan(0))
    expect(
      await screen.findByText(seedProject(SEED_IDS.PROJECT_TORRE_ID).name),
    ).toBeInTheDocument()

    projectQueries.forEach((q) => {
      expect(Number(q.get('page_size') ?? '0')).toBeLessThanOrEqual(20)
    })
  })

  it('falls back to the id when a row arrives without a name', async () => {
    server.use(
      http.get('*/v1/tasks/', () =>
        HttpResponse.json({
          items: [
            {
              id: 't-1',
              project_id: SEED_IDS.PROJECT_TORRE_ID,
              project_name: null,
              title: 'Pilotes',
              description: null,
              status: 'todo',
              priority: 'high',
              progress: 0,
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
              assignee_id: null,
              assignee_name: null,
              created_at: '2026-01-01T00:00:00Z',
              subtasks: [],
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
          total_pages: 1,
        }),
      ),
    )

    renderTaskDashboard()

    // Unnamed, but still grouped and still reachable — the heading links into
    // the obra's own schedule, and that only needs the id.
    expect(
      await screen.findByText(SEED_IDS.PROJECT_TORRE_ID),
    ).toBeInTheDocument()
  })
})

/**
 * The "assigned to me" tab on `/tasks` — the tab asks the *assigned* endpoint,
 * a row torn out of its project still names its obra and phase, and the open
 * tab lives in the URL rather than in component state.
 */

function renderTasks(route = '/tasks') {
  return renderWithProviders(<TasksView />, { store: makeStore(), route })
}

/** One row of the queue, in the shape `AssignedSubtaskResponse` returns. */
function assignedRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sa-1',
    parent_id: SEED_IDS.P1_TASK_FOUNDATION,
    title: 'Excavacion profunda',
    description: null,
    status: 'in_progress',
    priority: 'high',
    progress: 40,
    start_date: null,
    due_date: '2026-08-14',
    location: null,
    assignee_id: SEED_IDS.USER_FERNANDO_ID,
    assignee_name: 'Fernando Lopez',
    spent: '0.00',
    delay_reason: null,
    delay_days: 0,
    is_blocked: false,
    is_critical_path: false,
    force_started: false,
    at_risk: false,
    system_generated: false,
    created_at: '2026-01-01T00:00:00Z',
    project_id: SEED_IDS.PROJECT_TORRE_ID,
    project_name: 'Torre Empresarial Norte',
    parent_title: 'Cimentacion',
    ...overrides,
  }
}

function stubAssigned(items = [assignedRow()]) {
  server.use(
    http.get('*/v1/tasks/assigned', () =>
      HttpResponse.json({
        items,
        total: items.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      }),
    ),
  )
}

/** Records the query string of every `GET /v1/tasks/assigned` issued. */
function captureAssignedQueries() {
  const queries: URLSearchParams[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    if (url.pathname.endsWith('/v1/tasks/assigned')) {
      queries.push(url.searchParams)
    }
  })
  return queries
}

describe('TasksView — the two tabs', () => {
  it('opens on the portfolio list, which every role still sees', async () => {
    renderTasks()

    // The list stays the default. Both tabs are present for everybody —
    // there is no permission argument anywhere in this surface.
    expect(
      await screen.findByRole('tab', { name: /All main activities/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Assigned to me/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /All main activities/i }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('puts the open tab in the URL when it changes', async () => {
    const user = userEvent.setup()
    stubAssigned()
    renderTasks()

    await user.click(screen.getByRole('tab', { name: /Assigned to me/i }))

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
        'tab=assigned',
      )
    })
  })

  it('reopens the tab the URL names, so a reload and a shared link keep it', async () => {
    stubAssigned()
    // The reload: nothing is carried over from the previous render, the address
    // is the whole state.
    renderTasks('/tasks?tab=assigned')

    expect(
      await screen.findByRole('tab', { name: /Assigned to me/i }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByText('Excavacion profunda')).toBeInTheDocument()
  })

  it('falls back to the list for a ?tab= the page cannot mean', async () => {
    renderTasks('/tasks?tab=nonsense')

    expect(
      await screen.findByRole('tab', { name: /All main activities/i }),
    ).toHaveAttribute('aria-selected', 'true')
  })
})

describe('TasksView — the assigned queue', () => {
  it('renders the rows the assigned endpoint returned', async () => {
    stubAssigned([
      assignedRow(),
      assignedRow({ id: 'sa-2', title: 'Losa nivel 3' }),
    ])
    renderTasks('/tasks?tab=assigned')

    expect(await screen.findByText('Excavacion profunda')).toBeInTheDocument()
    expect(screen.getByText('Losa nivel 3')).toBeInTheDocument()
  })

  it('says which obra and which phase a row came from', async () => {
    stubAssigned()
    renderTasks('/tasks?tab=assigned')

    // Both names arrive on the row (`project_name`, `parent_title`). A queue
    // that spans the portfolio must not resolve them per row in the browser.
    expect(
      await screen.findByText('Torre Empresarial Norte'),
    ).toBeInTheDocument()
    expect(screen.getByText('Cimentacion')).toBeInTheDocument()
  })

  it('names only the obra for a row assigned at the first level', async () => {
    // The queue answers both levels; a first-level activity has no phase above
    // it, so `parent_id`/`parent_title` are null and the row must not show a
    // hole where a phase name would go.
    stubAssigned([
      assignedRow({ parent_id: null, parent_title: null, title: 'Entrega' }),
    ])
    renderTasks('/tasks?tab=assigned')

    expect(await screen.findByText('Entrega')).toBeInTheDocument()
    expect(screen.getByText('Torre Empresarial Norte')).toBeInTheDocument()
    expect(screen.queryByText('Cimentacion')).not.toBeInTheDocument()
  })

  it('asks the server for the caller and never for an assignee', async () => {
    const queries = captureAssignedQueries()
    stubAssigned()
    renderTasks('/tasks?tab=assigned')

    await waitFor(() => expect(queries.length).toBeGreaterThan(0))

    queries.forEach((q) => {
      // "Assigned to me" is literal: the token names the caller, so there is no
      // way to spell somebody else's queue from here.
      expect(q.has('assignee_id')).toBe(false)
      expect(q.get('organization_id')).toBe(SEED_IDS.ORG_LENNIX_ID)
    })
  })

  it('does not ask the list endpoint while it is open', async () => {
    const listQueries: string[] = []
    server.events.on('request:start', ({ request }) => {
      const url = new URL(request.url)
      if (url.pathname.endsWith('/v1/tasks/')) listQueries.push(url.pathname)
    })
    stubAssigned()
    renderTasks('/tasks?tab=assigned')

    await screen.findByText('Excavacion profunda')
    // The tabs are lazily mounted: two endpoints for two questions, one asked
    // at a time.
    expect(listQueries).toHaveLength(0)
  })

  it('says so when there is nothing assigned, instead of an empty page', async () => {
    stubAssigned([])
    renderTasks('/tasks?tab=assigned')

    expect(
      await screen.findByText('Nothing assigned to you'),
    ).toBeInTheDocument()
  })
})

describe('TasksView — the at-risk KPI drill-through', () => {
  it('lands on the list tab and asks the server for the KPI’s own population', async () => {
    const queries = captureTaskQueries()
    renderTasks('/tasks?tab=list&risk=at_risk')

    // `delay_days > 0 OR is_blocked`, answered over the whole organization.
    // Filtering the page it already had shows one row above a paginator
    // counting every unfiltered match.
    expect((await queryWith(queries, 'risk')).get('risk')).toBe('at_risk')
  })

  it('shows every row when no lens is asked for', async () => {
    const queries = captureTaskQueries()
    renderTasks('/tasks')

    await waitFor(() => expect(queries.length).toBeGreaterThan(0))
    queries.forEach((q) => expect(q.has('risk')).toBe(false))
  })
})

describe('TasksView — the assigned queue: search rides the shared debounce', () => {
  // The debounce pair (burst-collapses, box-never-lags) lives once, above:
  // both tabs read the same URL through the same hook, so one debounce pays
  // for both, and the timer contract itself is proven with fake timers in
  // src/hooks/use-debounced-value.test.ts. What is this tab's own is that the
  // term lands on the *assigned* endpoint.
  it('sends the settled term to the assigned endpoint', async () => {
    const user = userEvent.setup()
    const queries = captureAssignedQueries()
    stubAssigned()
    renderTasks('/tasks?tab=assigned')

    await screen.findByText('Excavacion profunda')

    await user.type(
      screen.getByPlaceholderText(/search main activities/i),
      'Excava',
    )

    await waitFor(() => {
      expect(
        queries
          .filter((q) => q.has('search'))
          .at(-1)
          ?.get('search'),
      ).toBe('Excava')
    })
  })
})
