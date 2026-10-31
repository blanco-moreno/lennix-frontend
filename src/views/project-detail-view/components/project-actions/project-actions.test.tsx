import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { Project } from '@/types'

import { ProjectActions } from './project-actions'

/** Torre, as the detail screen holds it after mapping. */
const project: Project = {
  id: SEED_IDS.PROJECT_TORRE_ID,
  organizationId: SEED_IDS.ORG_LENNIX_ID,
  name: 'Torre Residencial Norte',
  description:
    'Construccion de torre residencial de 25 pisos con 120 apartamentos',
  location: 'Av. Principal 123, Ciudad',
  status: 'on_track',
  priority: 'medium',
  budget: 850000,
  currency: 'USD',
  managerId: SEED_IDS.USER_MIGUEL_ID,
  managerName: 'Miguel Santos',
  isDraft: false,
  progress: 75,
  startDate: '2025-06-01',
  dueDate: '2026-08-01',
  allocated: 580000,
  indirectAllocated: 0,
  spent: 637000,
  isOverBudget: false,
  createdAt: '2025-06-01T00:00:00Z',
  health: { level: 'on_track', delayDays: 0, daysOverdue: 0 },
  reviewStep: null,
}

const ROLE_ID = {
  owner: 1,
  manager: 3,
  user: 5,
} as const

function renderActions(roleId: number, overrides: Partial<Project> = {}) {
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
  return renderWithProviders(
    <ProjectActions project={{ ...project, ...overrides }} />,
    { store, route: `/projects/${project.id}` },
  )
}

/** The actions dropdown trigger is icon-only; the popup attribute names it. */
function menuTrigger() {
  return screen
    .queryAllByRole('button')
    .find((button) => button.getAttribute('aria-haspopup') === 'menu')
}

describe('ProjectActions', () => {
  it('opens the edit drawer with priority and budget inline for the admin', async () => {
    renderActions(ROLE_ID.owner)

    // Priority and budget are fields of the edit drawer now, not buttons.
    expect(
      screen.queryByRole('button', { name: /change priority/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /update budget/i }),
    ).not.toBeInTheDocument()

    await userEvent.click(menuTrigger() as HTMLElement)
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /edit project/i }),
    )

    expect(await screen.findByLabelText(/Project name/)).toBeInTheDocument()
    expect(screen.getByLabelText('Priority')).toBeInTheDocument()
    expect(screen.getByLabelText('Budget (USD)')).toBeInTheDocument()
  })

  it('gives a `user` the drawer in request mode for the budget', async () => {
    renderActions(ROLE_ID.user)

    // A `user` edits the obra and creates activities, but never deletes it,
    // and the budget goes through an approver instead of applying (D-B).
    await userEvent.click(menuTrigger() as HTMLElement)
    expect(
      screen.queryByRole('menuitem', { name: /delete project/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /new activity/i }),
    ).toBeInTheDocument()
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /edit project/i }),
    )

    expect(
      await screen.findByText(/You are requesting a budget change/),
    ).toBeInTheDocument()
  })

  it('keeps deleting the obra with the organization-wide roles', async () => {
    renderActions(ROLE_ID.manager)

    await userEvent.click(menuTrigger() as HTMLElement)

    // A manager runs the obra but does not delete it: whoever deletes must be
    // able to restore, and the papelera is owner/admin (Q1).
    expect(
      await screen.findByRole('menuitem', { name: /edit project/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: /delete project/i }),
    ).not.toBeInTheDocument()
  })

  it('deletes only after confirmation, then leaves for the project list', async () => {
    const deletes: string[] = []
    server.use(
      http.delete(`*/v1/projects/${project.id}`, ({ request }) => {
        deletes.push(request.url)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderActions(ROLE_ID.owner)

    await userEvent.click(menuTrigger() as HTMLElement)
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /delete project/i }),
    )

    // Nothing sent yet: the confirmation stands between the click and the wire.
    expect(deletes).toHaveLength(0)
    expect(
      await screen.findByText(
        /Are you sure you want to delete "Torre Residencial Norte"\?/,
      ),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deletes).toHaveLength(1))
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent('/projects')
  })

  it('offers archiving only where the lifecycle allows it', async () => {
    renderActions(ROLE_ID.owner)

    // An on-track obra can be neither archived nor unarchived.
    await userEvent.click(menuTrigger() as HTMLElement)
    expect(
      await screen.findByRole('menuitem', { name: /edit project/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: /archive project/i }),
    ).not.toBeInTheDocument()
  })

  it('archives a completed project through the menu', async () => {
    const archives: string[] = []
    server.use(
      http.post(`*/v1/projects/${project.id}/archive`, ({ request }) => {
        archives.push(request.url)
        return HttpResponse.json({})
      }),
    )
    renderActions(ROLE_ID.owner, { status: 'completed' })

    await userEvent.click(menuTrigger() as HTMLElement)
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Archive project' }),
    )

    await waitFor(() => expect(archives).toHaveLength(1))
  })

  it('restores an archived project through the menu', async () => {
    const restores: string[] = []
    server.use(
      http.post(`*/v1/projects/${project.id}/unarchive`, ({ request }) => {
        restores.push(request.url)
        return HttpResponse.json({})
      }),
    )
    renderActions(ROLE_ID.owner, { status: 'archived' })

    await userEvent.click(menuTrigger() as HTMLElement)
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Unarchive project' }),
    )

    await waitFor(() => expect(restores).toHaveLength(1))
  })
})
