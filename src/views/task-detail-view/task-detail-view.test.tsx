/**
 * The activity's own page: identity card over one section at a time, project
 * held by the breadcrumb, subactivity carried by `?subtask=`. The address
 * always names the parent — a subactivity id in the path canonicalizes.
 */

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { PATHS } from '@/constants'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedTaskDTO } from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  SEARCH_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { TaskDetailView } from './task-detail-view'

const PROJECT = SEED_IDS.PROJECT_TORRE_ID
const PHASE: string = SEED_IDS.P1_TASK_FOUNDATION
const SUBACTIVITY: string = SEED_IDS.P1_SUB_DEEP_FOUNDATION

/** Role ids: 1 admin (sees budget), 6 safety manager (does not). */
function storeWithRole(roleId: number) {
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
  return store
}

function renderView({ taskId = PHASE, search = '', roleId = 1 } = {}) {
  return renderWithProviders(<TaskDetailView />, {
    store: storeWithRole(roleId),
    path: PATHS.TASK_DETAIL,
    route: `/projects/${PROJECT}/tasks/${taskId}${search}`,
  })
}

/** The 404 the real API answers for a subactivity id — the mock answers all. */
function subactivityRefusedAtPhaseAddress() {
  server.use(
    http.get('*/v1/tasks/:taskId', ({ params }) =>
      params.taskId === SUBACTIVITY
        ? HttpResponse.json({ detail: 'Not found' }, { status: 404 })
        : HttpResponse.json(seedTaskDTO(String(params.taskId))),
    ),
  )
}

describe('TaskDetailView', () => {
  it('shows the identity card over one section at a time — subactivities by default', async () => {
    renderView()

    expect(
      await screen.findByTestId('activity-section-subtasks'),
    ).toBeInTheDocument()
    for (const id of ['dependencies', 'budget']) {
      expect(
        screen.queryByTestId(`activity-section-${id}`),
      ).not.toBeInTheDocument()
    }
  })

  it('reads everything general from the header — no tab to open for dates', async () => {
    renderView()

    // The old "General" tab's facts, now in the always-visible header card.
    expect(await screen.findByText(/Start date/)).toBeInTheDocument()
    expect(screen.getByText('Total days')).toBeInTheDocument()
    expect(screen.getByText('Elapsed days')).toBeInTheDocument()
    // And no General section button remains.
    expect(
      screen.queryByRole('button', { name: 'General' }),
    ).not.toBeInTheDocument()
  })

  it('folds the header dates behind one toggle, so a phone reaches the list', async () => {
    renderView()

    const toggle = await screen.findByRole('button', { name: 'View detail' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('gathers the activity’s actions in one menu — edit and cancel', async () => {
    renderView()

    // The header keeps only the menu trigger now; cancel/reopen moved inside.
    await userEvent.click(
      await screen.findByRole('button', { name: 'More actions' }),
    )
    expect(
      await screen.findByRole('menuitem', { name: 'Edit main activity' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Cancel main activity' }),
    ).toBeInTheDocument()
    // A direct budget editor sets the budget inside the edit drawer — no
    // standalone budget button in the header.
    expect(
      screen.queryByRole('button', { name: 'Update budget' }),
    ).not.toBeInTheDocument()
  })

  it('orders the sections default-first: subactivities, dependencies, budget', async () => {
    renderView()

    const nav = await screen.findByRole('tablist')
    const labels = within(nav)
      .getAllByRole('tab')
      .map((tab) => tab.textContent)
    expect(labels[0]).toMatch(/^Subactivities/)
    expect(labels[1]).toMatch(/^Dependencies/)
    expect(labels[2]).toMatch(/^Budget/)
  })

  it('says each section’s count on its button, so the answer needs no click', async () => {
    renderView()

    // Cimentacion in the seed: 3 subactivities; edges on both sides.
    expect(
      await screen.findByRole('tab', { name: /Subactivities\s*3/ }),
    ).toBeInTheDocument()
  })

  it('writes a section change into the URL and swaps the section', async () => {
    renderView()
    await screen.findByTestId('activity-section-subtasks')

    await userEvent.click(
      await screen.findByRole('tab', { name: /Dependencies/ }),
    )

    expect(
      await screen.findByTestId('activity-section-dependencies'),
    ).toBeInTheDocument()
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      'panel=dependencies',
    )
    // The same editor the schedule's drawer shows, plus the calendar only this
    // surface draws: a link can be made from either without one being lesser.
    const section = screen.getByTestId('activity-section-dependencies')
    expect(section).toHaveTextContent('Waits for')
    expect(section).toHaveTextContent('Blocks')
    expect(
      within(section).getByTestId('dependency-timeline'),
    ).toBeInTheDocument()
  })

  it('lands ?subtask= on the subactivity list, narrowed to that row', async () => {
    renderView({ search: `?subtask=${SUBACTIVITY}` })

    expect(
      await screen.findByTestId('activity-section-subtasks'),
    ).toBeInTheDocument()
    // The row carries its own actions — there is nothing left to open.
    expect(await screen.findAllByTestId('subtask-row')).toHaveLength(1)
    expect(
      screen.queryByTestId('activity-section-dependencies'),
    ).not.toBeInTheDocument()
  })

  it('lists a selected subactivity’s links at its own level, not its parent’s', async () => {
    renderView({
      search: `?subtask=${SUBACTIVITY}&panel=dependencies`,
    })

    // The chain drawn is the subactivity's own: its predecessor beside it…
    const timeline = await screen.findByTestId('dependency-timeline')
    expect(
      await within(timeline).findByText('Excavacion para cimentacion'),
    ).toBeInTheDocument()
    // …and never the parent phase's chain standing in for it.
    expect(within(timeline).queryByText('Instalaciones')).toBeNull()
  })

  it('canonicalizes a subactivity id in the path to its parent’s address', async () => {
    subactivityRefusedAtPhaseAddress()
    renderView({ taskId: SUBACTIVITY })

    // The redirect lands on the parent, with the row riding as a query param…
    await waitFor(() => {
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
        `/projects/${PROJECT}/tasks/${PHASE}`,
      )
    })
    expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
      `subtask=${SUBACTIVITY}`,
    )
    // …and the page opens on the subactivity list, that card selected.
    expect(
      await screen.findByTestId('activity-section-subtasks'),
    ).toBeInTheDocument()
  })

  it('drops the budget section for a role that may not see it', async () => {
    renderView({ roleId: 6 })

    await screen.findByTestId('activity-section-subtasks')
    expect(
      screen.queryByRole('tab', { name: 'Budget' }),
    ).not.toBeInTheDocument()
  })
})
