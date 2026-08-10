import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedProjectTeamDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { AssignMemberDrawer } from './assign-member-drawer'

const projectId = SEED_IDS.PROJECT_TORRE_ID

/** Torre's seeded roster: Miguel, Fernando, Maria, Pedro. */
function torreMemberIds(): ReadonlySet<string> {
  return new Set(seedProjectTeamDTO(projectId).map((member) => member.user_id))
}

/** Records every body POSTed to the team endpoint. */
function captureAdds() {
  const bodies: Record<string, unknown>[] = []
  server.use(
    http.post(`*/v1/projects/${projectId}/team`, async ({ request }) => {
      bodies.push((await request.json()) as Record<string, unknown>)
      const team = seedProjectTeamDTO(projectId)
      return HttpResponse.json(
        { ...team[0], id: team.length + 1 },
        { status: 201 },
      )
    }),
  )
  return bodies
}

function renderModal({
  existing = torreMemberIds(),
  onOpenChange = () => {},
}: {
  existing?: ReadonlySet<string>
  onOpenChange?: (open: boolean) => void
} = {}) {
  return renderWithProviders(
    <AssignMemberDrawer
      projectId={projectId}
      projectName="Test Project"
      organizationId={SEED_IDS.ORG_LENNIX_ID}
      existingMemberUserIds={existing}
      open
      onOpenChange={onOpenChange}
    />,
    { store: makeStore(), route: `/projects/${projectId}` },
  )
}

describe('AssignMemberDrawer', () => {
  it('offers only the org members not already on the project', async () => {
    renderModal()

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog).findByLabelText('User'))

    // Laura is in the organization but not on Torre.
    expect(await screen.findByText('Laura Diaz')).toBeInTheDocument()
    // Miguel already is — offering him again could only ever 409.
    expect(screen.queryByText('Miguel Santos')).not.toBeInTheDocument()
  })

  it('sends a user id and nothing else, then closes', async () => {
    const bodies = captureAdds()
    const onOpenChange = vi.fn()
    renderModal({ onOpenChange })

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog).findByLabelText('User'))
    await userEvent.click(await screen.findByText('Laura Diaz'))
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Assign' }),
    )

    await waitFor(() => expect(bodies).toHaveLength(1))
    // Membership, nothing more: no role field to send.
    expect(bodies[0]).toEqual({ user_id: SEED_IDS.USER_LAURA_ID })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('cannot submit before a user is picked', async () => {
    renderModal()

    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByLabelText('User')

    expect(
      within(dialog).getByRole('button', { name: 'Assign' }),
    ).toBeDisabled()
  })

  it('says so when everybody is already on the project', async () => {
    // All 8 seeded org members are on the roster: nobody left to offer.
    const everybody = new Set(
      Object.entries(SEED_IDS)
        .filter(([name]) => name.startsWith('USER_'))
        .map(([, id]) => id),
    )
    renderModal({ existing: everybody })

    const dialog = await screen.findByRole('dialog')
    expect(
      await within(dialog).findByText(/no available members|already/i),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Assign' }),
    ).toBeDisabled()
  })

  it('reports a roster that could not be loaded instead of an empty picker', async () => {
    server.use(
      http.get('*/v1/organizations/:orgId/members', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderModal()

    expect(
      await screen.findByText('Could not load the organization members.'),
    ).toBeInTheDocument()
  })
})
