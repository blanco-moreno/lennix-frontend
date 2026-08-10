import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedProjectTeamDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectTeamPanel } from './project-team-panel'

const projectId = SEED_IDS.PROJECT_TORRE_ID

function renderPanel() {
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
      roleId: 1,
      organizationId: SEED_IDS.ORG_LENNIX_ID,
    }),
  )
  return renderWithProviders(
    <ProjectTeamPanel
      projectId={projectId}
      projectName="Test Project"
      organizationId={SEED_IDS.ORG_LENNIX_ID}
    />,
    { store, route: `/projects/${projectId}` },
  )
}

describe('ProjectTeamPanel', () => {
  it('is membership, not a role table', async () => {
    renderPanel()

    const team = seedProjectTeamDTO(projectId)
    expect(
      await screen.findByText(team[0].member_name as string),
    ).toBeInTheDocument()

    const headers = screen
      .getAllByRole('columnheader')
      .map((h) => h.textContent)
    expect(headers).toContain('Member')
    expect(headers).toContain('Member since')
    // `project_member.role` is "member" on every row now, so a Role column
    // could only ever repeat the same badge four times.
    expect(headers).not.toContain('Role')
  })

  it('adds a member with a user id and nothing else', async () => {
    const bodies: Record<string, unknown>[] = []
    server.use(
      http.post(`*/v1/projects/${projectId}/team`, async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>)
        const team = seedProjectTeamDTO(projectId)
        return HttpResponse.json(
          { ...team[team.length - 1], id: team.length + 1 },
          { status: 201 },
        )
      }),
    )
    renderPanel()

    await userEvent.click(
      await screen.findByRole('button', { name: /assign member/i }),
    )
    const dialog = await screen.findByRole('dialog')

    // No role select: the wire contract carries membership only.
    expect(within(dialog).queryByLabelText('Role')).not.toBeInTheDocument()

    await userEvent.click(within(dialog).getByLabelText('User'))
    // Laura is in the organization but not yet on this project.
    await userEvent.click(await screen.findByText('Laura Diaz'))
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Assign' }),
    )

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0]).toEqual({ user_id: SEED_IDS.USER_LAURA_ID })
  })

  it('labels the manager, and only the manager', async () => {
    renderPanel()

    const team = seedProjectTeamDTO(projectId)
    await screen.findByText(team[0].member_name as string)

    const badges = screen.getAllByTestId('member-manager-badge')
    expect(badges).toHaveLength(1)
    expect(badges[0]).toHaveTextContent('Project manager')

    const manager = team.find((member) => member.is_manager)
    const row = badges[0].closest('tr') as HTMLElement
    expect(row).toHaveTextContent(manager?.member_name as string)
  })

  it('offers no remove control on the manager’s row', async () => {
    renderPanel()

    const team = seedProjectTeamDTO(projectId)
    await screen.findByText(team[0].member_name as string)

    // Leadership is handed over from the project form, so the row that leads
    // the obra cannot be removed here — the backend answers 409, and a button
    // that can only fail is worse than no button.
    const managerRow = screen
      .getByTestId('member-manager-badge')
      .closest('tr') as HTMLElement
    expect(within(managerRow).queryByRole('button')).not.toBeInTheDocument()

    // Everybody else still has one.
    const rows = screen.getAllByRole('row').slice(1)
    const removable = rows.filter(
      (row) => within(row).queryAllByRole('button').length > 0,
    )
    expect(removable).toHaveLength(team.length - 1)
  })
})
