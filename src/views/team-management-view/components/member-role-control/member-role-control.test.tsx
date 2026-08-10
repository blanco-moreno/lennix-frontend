import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { PATHS } from '@/constants'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedOrganizationMemberListDTO } from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'
import { SEED_IDS, SEED_ORGANIZATION } from '@/tests/seed'
import type { OrganizationMember } from '@/types'

import { MemberRoleControl } from './member-role-control'

const organizationId = SEED_ORGANIZATION.id
const ownerId = SEED_ORGANIZATION.ownerId

/** Role ids: 1 owner, 2 admin, 3 manager, 5 user. */
function storeWithRole(roleId: number) {
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
      roleId,
      organizationId,
    }),
  )
  return store
}

/** Miguel — a manager in the seeded org, and not the owner. */
function seedMember(userId: string): OrganizationMember {
  const dto =
    seedOrganizationMemberListDTO().find((m) => m.user_id === userId) ??
    seedOrganizationMemberListDTO()[0]
  return {
    id: dto.id,
    organizationId: dto.organization_id,
    userId: dto.user_id,
    joinedAt: dto.joined_at,
    user: {
      userId: dto.user.user_id,
      email: dto.user.email,
      firstName: dto.user.first_name,
      lastName: dto.user.last_name,
      roleId: dto.user.role_id,
      roleSlug: dto.user.role_slug,
    },
  }
}

function renderControl({
  member = seedMember(SEED_IDS.USER_MIGUEL_ID),
  roleId = 1,
}: { member?: OrganizationMember; roleId?: number } = {}) {
  return renderWithProviders(
    <MemberRoleControl
      organizationId={organizationId}
      member={member}
      ownerId={ownerId}
    />,
    { store: storeWithRole(roleId), route: '/settings/team' },
  )
}

/** Answers the PATCH with one of ms-bk's structured refusals. */
function serveRoleFailure(code: string, status = 400) {
  server.use(
    http.patch(
      '*/v1/organizations/:organizationId/members/:userId/system-role',
      () =>
        HttpResponse.json(
          { detail: { code, message: 'ignored — the UI reads the code' } },
          { status },
        ),
    ),
  )
}

async function openDialog() {
  await userEvent.click(screen.getByRole('button', { name: /change role/i }))
  return screen.findByRole('dialog')
}

describe('MemberRoleControl', () => {
  it('grants a system role over PATCH', async () => {
    const bodies: unknown[] = []
    server.use(
      http.patch(
        '*/v1/organizations/:organizationId/members/:userId/system-role',
        async ({ request, params }) => {
          bodies.push({ userId: params.userId, body: await request.json() })
          const [row] = seedOrganizationMemberListDTO()
          return HttpResponse.json({ ...row, role: 'admin' })
        },
      ),
    )
    renderControl()

    const dialog = await openDialog()
    await userEvent.click(within(dialog).getByLabelText('Role'))
    // The actor here is the owner, and only the owner grants `admin` (D-D).
    expect(
      await screen.findByRole('option', { name: 'Admin' }),
    ).toBeInTheDocument()
    // `owner` is never on offer — it moves only with ownership.
    expect(
      screen.queryByRole('option', { name: 'Owner' }),
    ).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('option', { name: 'Manager' }))
    // The picker explains what it is granting, rather than naming a role only.
    expect(
      within(dialog).getByText(/Only the obras they belong to/i),
    ).toBeInTheDocument()
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Save role' }),
    )

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0]).toEqual({
      userId: SEED_IDS.USER_MIGUEL_ID,
      // One role axis. The grant writes `User.role_id`; `owner` is not a
      // value this surface can produce.
      body: { role_slug: 'manager' },
    })
  })

  it('explains owner_system_role_immutable and points at transferring ownership', async () => {
    serveRoleFailure('owner_system_role_immutable')
    renderControl()

    const dialog = await openDialog()
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Save role' }),
    )

    // Not a generic toast: the rule, and the way out.
    expect(
      await screen.findByText('The owner’s role cannot be changed here'),
    ).toBeInTheDocument()
    expect(screen.getByText(/transfer the organization/i)).toBeInTheDocument()
    expect(
      screen.queryByText('The role could not be changed. Try again.'),
    ).not.toBeInTheDocument()

    // The way out is a real one, not a sentence: it goes there.
    await userEvent.click(
      screen.getByRole('button', { name: 'Go to Organization settings' }),
    )
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(
      PATHS.SETTINGS,
    )
  })

  it('forgets a failed attempt when the dialog is reopened', async () => {
    serveRoleFailure('cannot_change_own_system_role')
    renderControl()

    const dialog = await openDialog()
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Save role' }),
    )
    expect(
      await screen.findByText('You cannot change your own role'),
    ).toBeInTheDocument()

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    )
    await openDialog()

    expect(
      screen.queryByText('You cannot change your own role'),
    ).not.toBeInTheDocument()
  })

  it('explains cannot_change_own_system_role, and why', async () => {
    serveRoleFailure('cannot_change_own_system_role')
    renderControl()

    const dialog = await openDialog()
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Save role' }),
    )

    expect(
      await screen.findByText('You cannot change your own role'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/only way to undo it|another Admin/i),
    ).toBeInTheDocument()
  })

  it('falls back to a generic message for an unstructured failure', async () => {
    server.use(
      http.patch(
        '*/v1/organizations/:organizationId/members/:userId/system-role',
        () => HttpResponse.json({ detail: 'not an admin' }, { status: 403 }),
      ),
    )
    renderControl()

    const dialog = await openDialog()
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Save role' }),
    )

    expect(
      await screen.findByText('The role could not be changed. Try again.'),
    ).toBeInTheDocument()
  })

  it('names the owner row instead of offering a control that must 400', () => {
    renderControl({ member: seedMember(ownerId) })

    expect(screen.getByText('Owner')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /change role/i }),
    ).not.toBeInTheDocument()
  })

  it('renders nothing for a role without user.role.manage', () => {
    // A `user` — granting roles belongs to owner and admin.
    renderControl({ roleId: 5 })

    expect(
      screen.queryByRole('button', { name: /change role/i }),
    ).not.toBeInTheDocument()
  })

  // Filtering the option was only half of D-D: an admin looking at ANOTHER
  // admin's row could only ever demote them, which the server answers 403.
  it('offers an admin no control at all on another admin’s row', () => {
    renderControl({ member: seedMember(SEED_IDS.USER_ANA_ID), roleId: 2 })

    expect(
      screen.queryByRole('button', { name: /change role/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Only the owner changes this')).toBeInTheDocument()
  })

  it('keeps that row editable for the owner', () => {
    renderControl({ member: seedMember(SEED_IDS.USER_ANA_ID), roleId: 1 })

    expect(
      screen.getByRole('button', { name: /change role/i }),
    ).toBeInTheDocument()
  })

  // The rule about the actor is a 403, not a 400 — a generic "try again"
  // names no rule and offers no way out.
  it('explains the 403 only_owner_manages_admins instead of a generic error', async () => {
    serveRoleFailure('only_owner_manages_admins', 403)
    renderControl({ roleId: 2 })

    const dialog = await openDialog()
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Save role' }),
    )

    expect(
      await screen.findByText('Only the owner manages admins'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('The role could not be changed. Try again.'),
    ).not.toBeInTheDocument()
  })

  it('hides the admin option from an admin actor (D-D)', async () => {
    // An admin grants and revokes `manager` and `user`; only the owner hands
    // out `admin`, so the value is not even offered.
    renderControl({ roleId: 2 })

    const dialog = await openDialog()
    await userEvent.click(within(dialog).getByLabelText('Role'))

    expect(
      await screen.findByRole('option', { name: 'Manager' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Admin' }),
    ).not.toBeInTheDocument()
  })
})
