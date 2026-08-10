import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { useGetProjectQuery } from '@/services/project'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { pageOf, seedProjectDetailDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProjectActions } from '../project-actions'

import { ProjectManagerField } from './project-manager-field'

const projectId = SEED_IDS.PROJECT_TORRE_ID

/** Role ids: 1 owner, 2 admin, 5 user. */
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
      organizationId: SEED_IDS.ORG_LENNIX_ID,
    }),
  )
  return store
}

/**
 * What `ProjectDetailView` does with the header: it renders the manager line
 * and the actions from the RTK Query cache entry for the project. So a
 * handover only reaches the header if the update mutation invalidates that
 * entry — which is what the second test pins.
 */
function ProjectHeaderHarness() {
  const { data } = useGetProjectQuery(projectId)
  if (!data) return null
  return (
    <>
      {data.managerName && <span>Manager: {data.managerName}</span>}
      <ProjectActions project={data} />
    </>
  )
}

/**
 * Serves the project, flipping its manager the moment a PUT lands — the
 * backend's behaviour after #20 fixed the PUT re-serving the *previous*
 * manager's name. Returns the request bodies it received.
 */
function serveHandover(newManagerId: string, newManagerName: string) {
  const bodies: Record<string, unknown>[] = []
  const seeded = seedProjectDetailDTO(projectId)
  let managerId = seeded.manager_id
  let managerName = seeded.manager_name

  const detail = () =>
    seedProjectDetailDTO(projectId, {
      manager_id: managerId,
      manager_name: managerName,
    })

  server.use(
    http.get(`*/v1/projects/${projectId}`, () => HttpResponse.json(detail())),
    http.put(`*/v1/projects/${projectId}`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      bodies.push(body)
      if (typeof body.manager_id === 'string') {
        managerId = newManagerId
        managerName = newManagerName
      }
      return HttpResponse.json(detail())
    }),
  )
  return bodies
}

/** The header hides "Edit project" behind its overflow menu. */
async function openEditModal() {
  // The overflow trigger is icon-only, so it has no accessible name to query by.
  const trigger = await waitFor(() => {
    const el = document.querySelector<HTMLElement>('[aria-haspopup="menu"]')
    if (!el) throw new Error('the header rendered no overflow menu')
    return el
  })
  await userEvent.click(trigger)
  await userEvent.click(
    await screen.findByRole('menuitem', { name: /edit project/i }),
  )
  return screen.findByRole('dialog')
}

async function pickManager(name: string) {
  await userEvent.click(screen.getByLabelText('Project manager'))
  await userEvent.click(await screen.findByText(name))
}

describe('ProjectManagerField', () => {
  it('offers whoever the obra accepts, and says what the outsiders are', async () => {
    renderWithProviders(<ProjectHeaderHarness />, {
      store: storeWithRole(1),
      route: `/projects/${projectId}`,
    })

    await openEditModal()
    await userEvent.click(await screen.findByLabelText('Project manager'))

    const offered = (await screen.findAllByRole('option')).map(
      (option) => option.textContent,
    )

    // Torre's own team, unbadged — they are on the obra, which needs no
    // explanation.
    expect(offered).toContain('Miguel Santos')
    expect(offered).toContain('Pedro Sanchez')
    // Carlos owns the organization and Ana administers it: neither holds a
    // membership row here, both are accepted by the backend all the same, and
    // the badge is what tells the person choosing who they are.
    expect(offered).toContain('Carlos RodriguezOwner')
    expect(offered).toContain('Ana MartinezAdmin')
    // Laura is a `manager` off this obra, and this field takes the **wide**
    // set: naming her as jefe de obra seats her on it, so refusing to offer her
    // would hide a hand-over the backend accepts. She is badged, like every
    // other row without a membership here.
    expect(offered).toContain('Laura DiazManager')
  })

  it('hands the obra over and the header follows without a reload', async () => {
    const bodies = serveHandover(SEED_IDS.USER_PEDRO_ID, 'Pedro Sanchez')

    renderWithProviders(<ProjectHeaderHarness />, {
      store: storeWithRole(1),
      route: `/projects/${projectId}`,
    })

    // Miguel leads Torre Residencial Norte in the seed.
    expect(await screen.findByText(/Miguel Santos/)).toBeInTheDocument()

    await openEditModal()
    await pickManager('Pedro Sanchez')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0].manager_id).toBe(SEED_IDS.USER_PEDRO_ID)

    // No remount and no navigation: the update invalidated the project cache
    // entry, so the header re-rendered off the refetch.
    await waitFor(() => {
      expect(screen.getByText(/Pedro Sanchez/)).toBeInTheDocument()
    })
    expect(screen.queryByText(/Miguel Santos/)).not.toBeInTheDocument()
  })

  it('sends no manager_id when the picker was not touched', async () => {
    const bodies = serveHandover(SEED_IDS.USER_PEDRO_ID, 'Pedro Sanchez')

    renderWithProviders(<ProjectHeaderHarness />, {
      store: storeWithRole(1),
      route: `/projects/${projectId}`,
    })

    await openEditModal()
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    // The API applies `manager_id` whenever it arrives non-null and has no way
    // to clear one, so re-sending the current manager is noise.
    expect(bodies[0]).not.toHaveProperty('manager_id')
  })

  it('says what to do instead of offering an empty picker', async () => {
    server.use(
      http.get(`*/v1/projects/${projectId}/assignable-members`, () =>
        HttpResponse.json(pageOf([])),
      ),
      http.get(`*/v1/projects/${projectId}`, () =>
        HttpResponse.json(
          seedProjectDetailDTO(projectId, {
            manager_id: null,
            manager_name: null,
            members: [],
          }),
        ),
      ),
    )

    renderWithProviders(<ProjectHeaderHarness />, {
      store: storeWithRole(1),
      route: `/projects/${projectId}`,
    })

    await openEditModal()
    expect(
      await screen.findByText(/Nobody is on this project yet/),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Project manager')).not.toBeInTheDocument()
  })

  it('renders nothing for a role without project.team.manage', () => {
    renderWithProviders(
      <ProjectManagerField
        projectId={projectId}
        value=""
        onChange={() => {}}
        currentManagerId={null}
        currentManagerName={null}
      />,
      // A field supervisor. The backend's own key for administering who is on
      // a project is what gates leadership too — no permission invented here.
      { store: storeWithRole(5), route: `/projects/${projectId}` },
    )

    expect(screen.queryByLabelText('Project manager')).not.toBeInTheDocument()
    expect(screen.queryByText(/Project manager/)).not.toBeInTheDocument()
  })

  it('keeps the sitting manager selectable after they leave the team', async () => {
    server.use(
      http.get(`*/v1/projects/${projectId}/assignable-members`, () =>
        HttpResponse.json(pageOf([])),
      ),
    )

    renderWithProviders(
      <ProjectManagerField
        projectId={projectId}
        value={SEED_IDS.USER_MIGUEL_ID}
        onChange={() => {}}
        currentManagerId={SEED_IDS.USER_MIGUEL_ID}
        currentManagerName="Miguel Santos"
      />,
      { store: storeWithRole(1), route: `/projects/${projectId}` },
    )

    // Opening the form must never silently propose a handover.
    expect(await screen.findByText('Miguel Santos')).toBeInTheDocument()
  })
})
