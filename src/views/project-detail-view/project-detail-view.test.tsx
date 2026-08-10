import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import {
  LOCATION_TEST_ID,
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectDetailView } from './project-detail-view'

const projectId = SEED_IDS.PROJECT_TORRE_ID

function renderDetail(roleId: number, search = '') {
  const store = makeStore()
  store.dispatch(
    setUser({
      userId: SEED_IDS.USER_CARLOS_ID,
      email: 'carlos.rodriguez@lennix-test.com',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      phone: null,
      isActive: true,
      planId: null,
      roleId,
      organizationId: SEED_IDS.ORG_LENNIX_ID,
    }),
  )
  return renderWithProviders(<ProjectDetailView />, {
    store,
    route: `/projects/${projectId}${search}`,
    path: '/projects/:projectId',
  })
}

function tabNames() {
  return screen.getAllByRole('tab').map((tab) => tab.textContent)
}

describe('ProjectDetailView', () => {
  it('loads the routed project and gives an admin every tab', async () => {
    renderDetail(1)

    expect(
      await screen.findByRole('tab', { name: 'Schedule' }),
    ).toBeInTheDocument()
    expect(tabNames()).toEqual([
      'Schedule',
      'Budget',
      'Team',
      'Risks and delays',
      'History',
    ])
  })

  it('shows every obra tab to a member-scoped role', async () => {
    // A `user` is not a narrower *function* any more, only a narrower *scope*:
    // on an obra they belong to they read the same tabs. Which obras those are
    // is membership, enforced by the backend.
    renderDetail(5)

    await screen.findByRole('tab', { name: 'Schedule' })
    expect(tabNames()).toEqual([
      'Schedule',
      'Budget',
      'Team',
      'Risks and delays',
      'History',
    ])
  })

  it('keeps the open tab in the URL — a tab is a link', async () => {
    renderDetail(1)

    await screen.findByRole('tab', { name: 'Schedule' })
    await userEvent.click(screen.getByRole('tab', { name: 'Team' }))

    await waitFor(() => {
      expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent('tab=team')
    })
    // The team panel really is what renders: the seeded roster shows up.
    expect(await screen.findByText('Miguel Santos')).toBeInTheDocument()
  })

  it('opens directly on the tab the URL names', async () => {
    renderDetail(1, '?tab=history')

    await screen.findByRole('tab', { name: 'Schedule' })
    expect(
      screen.getByRole('tab', { name: 'History', selected: true }),
    ).toBeInTheDocument()
  })

  it('shows identity in the shared shell: manager, location, badges', async () => {
    renderDetail(1)

    await screen.findByRole('tab', { name: 'Schedule' })
    expect(screen.getByText(/Manager:\s?Miguel Santos/)).toBeInTheDocument()
    expect(screen.getByText('Av. Principal 123, Ciudad')).toBeInTheDocument()
    // The seed's due dates are absolute and Torre's has passed, so its verdict
    // is `overdue` — which is the point: the detail prints what the server
    // says, in the same word the listing and the home print, instead of
    // reading `status` (still `on_track`) and calling the obra healthy.
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText(/Priority:\s?High/)).toBeInTheDocument()
  })

  it('reads the general information from the header, whatever tab is open', async () => {
    renderDetail(1, '?tab=history')

    // KPIs and overall progress live in the header card now — visible even
    // with a non-schedule tab open below.
    await screen.findByRole('tab', { name: 'Schedule' })
    expect(await screen.findByText('Critical-path slip')).toBeInTheDocument()
    expect(screen.getByText('Activities at risk')).toBeInTheDocument()
    expect(screen.getByText('Budget used')).toBeInTheDocument()
    // Twice on purpose: the KPI tile and the progress section share the name.
    expect(screen.getAllByText('Overall progress').length).toBeGreaterThan(0)
  })

  it('redirects a drawer-era link (?activity=&panel=) to the activity page', async () => {
    renderDetail(1, `?activity=${SEED_IDS.P1_TASK_FOUNDATION}&panel=budget`)

    await waitFor(() => {
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        `/projects/${projectId}/tasks/${SEED_IDS.P1_TASK_FOUNDATION}`,
      )
    })
    // The section the link named survives the move.
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent('panel=budget')
  })

  it('keeps ?task= without ?panel= as the schedule selection, no redirect', async () => {
    renderDetail(1, `?task=${SEED_IDS.P1_TASK_FOUNDATION}`)

    await screen.findByRole('tab', { name: 'Schedule' })
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
      `/projects/${projectId}`,
    )
  })

  it('shows a loading state, then the error state when the project cannot load', async () => {
    server.use(
      http.get(`*/v1/projects/${projectId}`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderDetail(1)

    expect(screen.getByTestId('detail-shell')).toHaveAttribute(
      'aria-busy',
      'true',
    )
    await waitFor(() => {
      expect(screen.getByText('Could not load the project')).toBeInTheDocument()
    })
  })
})
