import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedOrganizationMemberListDTO, seedUser } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS, SEED_ORGANIZATION } from '@/tests/seed'

import { TeamManagementView } from './team-management-view'

/** Role ids: 1 owner, 5 user. */
function renderTeam(roleId = 1) {
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
      organizationId: SEED_ORGANIZATION.id,
    }),
  )
  return renderWithProviders(<TeamManagementView />, {
    store,
    route: '/settings/team',
  })
}

async function openAddModal() {
  await userEvent.click(
    await screen.findByRole('button', { name: /add member/i }),
  )
  return screen.findByRole('dialog')
}

describe('TeamManagementView — the organization role', () => {
  it('creates a member without choosing a role', async () => {
    const registerBodies: Record<string, unknown>[] = []
    const memberBodies: Record<string, unknown>[] = []
    const pedro = seedUser(SEED_IDS.USER_PEDRO_ID)

    server.use(
      http.post('*/v1/auth/register', async ({ request }) => {
        registerBodies.push((await request.json()) as Record<string, unknown>)
        return HttpResponse.json(
          {
            user_id: pedro.userId,
            email: 'nueva.persona@lennix-test.com',
            first_name: 'Nueva',
            last_name: 'Persona',
            phone: null,
            is_active: true,
            plan_id: null,
            role_id: pedro.roleId,
            organization_id: SEED_ORGANIZATION.id,
          },
          { status: 201 },
        )
      }),
      http.post(
        '*/v1/organizations/:organizationId/members',
        async ({ request }) => {
          memberBodies.push((await request.json()) as Record<string, unknown>)
          const [row] = seedOrganizationMemberListDTO()
          return HttpResponse.json({ ...row, role: 'admin' }, { status: 201 })
        },
      ),
    )

    renderTeam()
    const dialog = await openAddModal()

    await userEvent.type(within(dialog).getByLabelText('First name'), 'Nueva')
    await userEvent.type(within(dialog).getByLabelText('Last name'), 'Persona')
    await userEvent.type(
      within(dialog).getByLabelText('Email address'),
      'nueva.persona@lennix-test.com',
    )
    // No role picker here. The backend assigns the default `user` role and a role
    // is granted afterwards, from the row's own control.
    expect(within(dialog).queryByLabelText('Organization role')).toBeNull()
    await userEvent.click(
      within(dialog).getByRole('button', { name: /create/i }),
    )

    await waitFor(() => {
      expect(memberBodies).toHaveLength(1)
    })
    // Membership carries no role, so the body is the user id and nothing
    // else.
    expect(memberBodies[0]).toEqual({ user_id: pedro.userId })
    // The role is assigned server-side and never sent from here.
    expect(registerBodies[0]).not.toHaveProperty('role_id')
  })

  it('offers no role choice at all when creating a member', async () => {
    // Admin — the create-member modal itself is what's under test here;
    // a `user` cannot reach it (org.team.manage is owner/admin).
    renderTeam()

    const dialog = await openAddModal()

    expect(
      within(dialog).queryByLabelText('Organization role'),
    ).not.toBeInTheDocument()
    expect(within(dialog).queryByLabelText('Role')).not.toBeInTheDocument()
  })

  it('hides the add-member control for a role without org.team.manage', async () => {
    // Role-scoped access — the control is admin-only.
    renderTeam(5)

    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /add member/i }),
    ).not.toBeInTheDocument()
  })
})
