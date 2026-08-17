import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DataTable } from '@/components/ui/data-table'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import {
  FIXTURE_CREATED_AT,
  seedOrganizationMemberListDTO,
  seedUser,
} from '@/tests/fixtures'
import { displayedDate } from '@/tests/intl-date'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS, SEED_ORGANIZATION } from '@/tests/seed'
import type { OrganizationMember } from '@/types'

import { useMemberColumns } from './member-columns'

const organizationId = SEED_ORGANIZATION.id
const ownerId = SEED_ORGANIZATION.ownerId

/** The seeded membership rows, as the mapped domain shape the columns read. */
function seedMember(userId: string): OrganizationMember {
  const dto = seedOrganizationMemberListDTO().find((m) => m.user_id === userId)
  if (!dto) throw new Error(`user ${userId} is not a seeded member`)
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

interface HarnessProps {
  members: OrganizationMember[]
  canManageTeam: boolean
  currentUserId: string
  onRemoveMember: (userId: string) => Promise<void>
  onResetPassword: (userId: string, email: string) => Promise<void>
}

/** The rendered surface of the hook is the members DataTable. */
function Harness({
  members,
  canManageTeam,
  currentUserId,
  onRemoveMember,
  onResetPassword,
}: HarnessProps) {
  const columns = useMemberColumns({
    organizationId,
    ownerId,
    currentUserId,
    canManageTeam,
    onRemoveMember,
    onResetPassword,
  })
  return <DataTable columns={columns} data={members} emptyMessage="empty" />
}

function renderColumns({
  canManageTeam = true,
  // Carlos is both the signed-in user and the org owner — the seeded truth.
  actorId = SEED_IDS.USER_CARLOS_ID as string,
  onRemoveMember = vi.fn().mockResolvedValue(undefined),
  onResetPassword = vi.fn().mockResolvedValue(undefined),
} = {}) {
  const members = [
    seedMember(SEED_IDS.USER_CARLOS_ID),
    seedMember(SEED_IDS.USER_ANA_ID),
    seedMember(SEED_IDS.USER_MIGUEL_ID),
  ]
  const store = makeStore()
  const actor = seedUser(actorId)
  // Actor in the store: MemberRoleControl and the password action read the
  // signed-in role themselves.
  store.dispatch(
    setUser({
      userId: actorId,
      email: actor.email,
      firstName: actor.firstName,
      lastName: actor.lastName,
      phone: null,
      isActive: true,
      planId: null,
      roleId: actor.roleId,
      organizationId,
    }),
  )
  renderWithProviders(
    <Harness
      members={members}
      canManageTeam={canManageTeam}
      currentUserId={actorId}
      onRemoveMember={onRemoveMember}
      onResetPassword={onResetPassword}
    />,
    { store, route: '/settings/team' },
  )
  return { onRemoveMember, onResetPassword }
}

const RESET_NAME = /regenerate password/i

function resetButtonIn(row: HTMLElement) {
  return within(row).queryByRole('button', { name: RESET_NAME })
}

function rowOf(userId: string): HTMLElement {
  const row = screen.getByText(seedUser(userId).email).closest('tr')
  if (!row) throw new Error('member row not found')
  return row as HTMLElement
}

describe('useMemberColumns', () => {
  it('renders name with self badge, role badge and joined-at for the seeded rows', () => {
    renderColumns()

    const carlosRow = rowOf(SEED_IDS.USER_CARLOS_ID)
    const miguelRow = rowOf(SEED_IDS.USER_MIGUEL_ID)

    // Only the signed-in user's row carries the "You" badge.
    expect(within(carlosRow).getByText('You')).toBeInTheDocument()
    expect(within(miguelRow).queryByText('You')).not.toBeInTheDocument()
    // The role badge translates the seeded slug, it does not echo it.
    expect(within(miguelRow).getByText('Manager')).toBeInTheDocument()
    expect(
      within(miguelRow).getByText(displayedDate(FIXTURE_CREATED_AT)),
    ).toBeInTheDocument()
  })

  it('marks the owner row instead of a role control, and disables removing yourself', () => {
    renderColumns()

    // Carlos is owner and self: the row says Owner twice — the role badge and
    // the hint that replaces the control — offers no role change, and its
    // remove button cannot fire.
    const carlosRow = rowOf(SEED_IDS.USER_CARLOS_ID)
    expect(within(carlosRow).getAllByText('Owner')).toHaveLength(2)
    expect(
      within(carlosRow).queryByRole('button', { name: /change role/i }),
    ).not.toBeInTheDocument()
    const [selfRemove] = within(carlosRow)
      .getAllByRole('button')
      .filter((b) => !RESET_NAME.test(b.getAttribute('aria-label') ?? ''))
    expect(selfRemove).toBeDisabled()

    // A regular member's row has both actions live.
    const miguelRow = rowOf(SEED_IDS.USER_MIGUEL_ID)
    expect(
      within(miguelRow).getByRole('button', { name: /change role/i }),
    ).toBeInTheDocument()
  })

  it('removes a member only after the confirmation, passing the row user id', async () => {
    const { onRemoveMember } = renderColumns()

    const miguelRow = rowOf(SEED_IDS.USER_MIGUEL_ID)
    const removeButton = within(miguelRow)
      .getAllByRole('button')
      .find(
        (b) =>
          !/change role/i.test(b.textContent ?? '') &&
          !RESET_NAME.test(b.getAttribute('aria-label') ?? ''),
      )
    if (!removeButton) throw new Error('remove button not found')
    await userEvent.click(removeButton)

    // Nothing removed yet — it is a confirmed destructive action.
    expect(onRemoveMember).not.toHaveBeenCalled()

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Remove' }),
    )

    await waitFor(() => {
      expect(onRemoveMember).toHaveBeenCalledWith(SEED_IDS.USER_MIGUEL_ID)
    })
  })

  it('offers no remove button at all without org.team.manage', () => {
    renderColumns({ canManageTeam: false })

    // The role control (its own permission) survives; the remove and
    // regenerate-password actions — gated by canManageTeam — are hidden.
    const miguelRow = rowOf(SEED_IDS.USER_MIGUEL_ID)
    const buttons = within(miguelRow).getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toHaveTextContent(/change role/i)
  })

  it('lets the owner regenerate every password but their own', () => {
    renderColumns()

    expect(resetButtonIn(rowOf(SEED_IDS.USER_CARLOS_ID))).toBeNull()
    expect(resetButtonIn(rowOf(SEED_IDS.USER_ANA_ID))).toBeInTheDocument()
    expect(resetButtonIn(rowOf(SEED_IDS.USER_MIGUEL_ID))).toBeInTheDocument()
  })

  it('hides the action from an admin on the owner, other admins and themself', () => {
    // Ana is the seeded admin.
    renderColumns({ actorId: SEED_IDS.USER_ANA_ID })

    expect(resetButtonIn(rowOf(SEED_IDS.USER_CARLOS_ID))).toBeNull()
    expect(resetButtonIn(rowOf(SEED_IDS.USER_ANA_ID))).toBeNull()
    expect(resetButtonIn(rowOf(SEED_IDS.USER_MIGUEL_ID))).toBeInTheDocument()
  })

  it('regenerates only after the confirmation, passing the row user id and email', async () => {
    const { onResetPassword } = renderColumns()

    const miguelRow = rowOf(SEED_IDS.USER_MIGUEL_ID)
    const button = resetButtonIn(miguelRow)
    if (!button) throw new Error('reset button not found')
    await userEvent.click(button)
    expect(onResetPassword).not.toHaveBeenCalled()

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Regenerate' }),
    )

    await waitFor(() => {
      expect(onResetPassword).toHaveBeenCalledWith(
        SEED_IDS.USER_MIGUEL_ID,
        seedUser(SEED_IDS.USER_MIGUEL_ID).email,
      )
    })
  })
})
