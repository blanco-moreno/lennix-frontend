import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import {
  pageOf,
  seedPendingForceStartRequestDTO,
  seedSubtaskDTO,
  seedTaskDTO,
} from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

/** Role ids: 1 owner, 2 admin, 3 manager, 5 user. Only a `user` requests. */
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

import { ForceStart } from './force-start'

async function openDialog() {
  await userEvent.click(
    screen.getByRole('button', { name: /request force start/i }),
  )
  return screen.findByRole('dialog')
}

describe('ForceStart', () => {
  it('opens the justification in a modal', async () => {
    renderWithProviders(
      <ForceStart
        target="subtask"
        id={SEED_IDS.P1_SUB_EXCAVATION}
        name="Excavación"
      />,
      { store: storeWithRole(5) },
    )

    await userEvent.click(
      screen.getByRole('button', { name: /request force start/i }),
    )

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByLabelText(/why does it have to start now/i),
    ).toBeInTheDocument()
  })

  it('asks for approval instead of overriding the block itself', async () => {
    const bodies: unknown[] = []
    server.use(
      http.post('*/v1/force-start-requests', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json(seedPendingForceStartRequestDTO(), {
          status: 201,
        })
      }),
    )

    renderWithProviders(
      <ForceStart
        target="subtask"
        id={SEED_IDS.P1_SUB_EXCAVATION}
        name="Excavación"
      />,
      { store: storeWithRole(5) },
    )

    const dialog = await openDialog()
    await userEvent.type(
      within(dialog).getByLabelText(/why does it have to start now/i),
      'La cuadrilla ya está en obra.',
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: /send request/i }),
    )

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0]).toEqual({
      task_id: SEED_IDS.P1_SUB_EXCAVATION,
      reason: 'La cuadrilla ya está en obra.',
    })
  })

  it('warns that approval leaves a permanent mark, in the target vocabulary', async () => {
    renderWithProviders(
      <ForceStart
        target="task"
        id={SEED_IDS.P1_TASK_STRUCTURE}
        name="Estructura"
      />,
      { store: storeWithRole(5) },
    )

    const dialog = await openDialog()
    expect(
      within(dialog).getByText(/this main activity has pending dependencies/i),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText(/marked at risk permanently/i),
    ).toBeInTheDocument()

    await userEvent.click(within(dialog).getByText('Cancel'))
  })

  it('will not send a request without a justification', async () => {
    const bodies: unknown[] = []
    server.use(
      http.post('*/v1/force-start-requests', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json(seedPendingForceStartRequestDTO(), {
          status: 201,
        })
      }),
    )

    renderWithProviders(
      <ForceStart
        target="task"
        id={SEED_IDS.P1_TASK_STRUCTURE}
        name="Estructura"
      />,
      { store: storeWithRole(5) },
    )

    const dialog = await openDialog()
    await userEvent.click(
      within(dialog).getByRole('button', { name: /send request/i }),
    )

    expect(
      await within(dialog).findByText(/explain why this activity must start/i),
    ).toBeInTheDocument()
    expect(bodies).toHaveLength(0)

    await userEvent.click(within(dialog).getByText('Cancel'))
  })

  it('shows a pending state instead of a second request', async () => {
    server.use(
      http.post('*/v1/force-start-requests', () =>
        HttpResponse.json(seedPendingForceStartRequestDTO(), { status: 201 }),
      ),
    )

    renderWithProviders(
      <ForceStart
        target="task"
        id={SEED_IDS.P1_TASK_STRUCTURE}
        name="Estructura"
      />,
      { store: storeWithRole(5) },
    )

    const dialog = await openDialog()
    await userEvent.type(
      within(dialog).getByLabelText(/why does it have to start now/i),
      'Ruta crítica.',
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: /send request/i }),
    )

    expect(
      await screen.findByText(/force start requested/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /request force start/i }),
    ).toBeNull()
  })

  it('reads a pending request of its own off the server', async () => {
    server.use(
      http.get('*/v1/force-start-requests', () =>
        HttpResponse.json(
          pageOf([
            seedPendingForceStartRequestDTO({
              task_id: SEED_IDS.P1_TASK_STRUCTURE,
            }),
          ]),
        ),
      ),
    )

    renderWithProviders(
      <ForceStart
        target="task"
        id={SEED_IDS.P1_TASK_STRUCTURE}
        name="Estructura"
      />,
      // The backend scopes the list to `requestor_id` for a `user`, so what
      // comes back is already this person's own pending request.
      { store: storeWithRole(5) },
    )

    expect(
      await screen.findByText(/force start requested/i),
    ).toBeInTheDocument()
  })

  it('asks once for a screen full of rows, not once per row', async () => {
    const urls: string[] = []
    server.events.on('request:start', ({ request }) => {
      const url = new URL(request.url)
      if (url.pathname.endsWith('/v1/force-start-requests')) {
        urls.push(url.search)
      }
    })
    server.use(
      http.get('*/v1/force-start-requests', () =>
        HttpResponse.json(
          pageOf([
            seedPendingForceStartRequestDTO({
              task_id: SEED_IDS.P1_TASK_STRUCTURE,
            }),
          ]),
        ),
      ),
    )

    // `/tasks` mounts one of these per activity. Filtering by `task_id` on the
    // server meant a request per row for a list the approvals badge is already
    // holding.
    const rows = [
      SEED_IDS.P1_TASK_STRUCTURE,
      SEED_IDS.P1_SUB_EXCAVATION,
      SEED_IDS.P1_TASK_FOUNDATION,
    ]
    renderWithProviders(
      <>
        {rows.map((id) => (
          <ForceStart key={id} target="task" id={id} name={id} />
        ))}
      </>,
      { store: storeWithRole(5) },
    )

    // The row that has one says so, which is what the shared list is for.
    expect(
      await screen.findByText(/force start requested/i),
    ).toBeInTheDocument()

    await waitFor(() => expect(urls.length).toBeGreaterThan(0))
    expect(urls).toEqual(['?state=pending&page_size=20'])
    expect(urls.some((search) => search.includes('task_id'))).toBe(false)
  })

  it('never asks a role that can force the start itself', async () => {
    renderWithProviders(
      <ForceStart
        target="task"
        id={SEED_IDS.P1_TASK_STRUCTURE}
        name="Estructura"
      />,
      // An admin holds `forceStart.direct`, not `forceStart.request`: they
      // override the block, they do not file paperwork for it.
      { store: storeWithRole(2) },
    )

    expect(
      screen.queryByRole('button', { name: /request force start/i }),
    ).toBeNull()
    expect(
      await screen.findByRole('button', { name: /^force start$/i }),
    ).toBeInTheDocument()
  })
})

/**
 * The direct door. `forceStart.direct` is owner/admin/manager's key, and the
 * two backend endpoints differ by target — a phase goes to
 * `/v1/tasks/{id}/force-start`, a subactivity to
 * `/v1/tasks/subtasks/{id}/force-start`.
 */
describe('ForceStart — direct override', () => {
  async function confirmDirect() {
    await userEvent.click(
      screen.getByRole('button', { name: /^force start$/i }),
    )
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: /^force start$/i }),
    )
  }

  it.each([
    ['manager', 3],
    ['owner', 1],
  ])('gives %s the direct control, not the request one', (_role, roleId) => {
    renderWithProviders(
      <ForceStart
        target="task"
        id={SEED_IDS.P1_TASK_STRUCTURE}
        name="Estructura"
      />,
      { store: storeWithRole(roleId) },
    )

    expect(
      screen.getByRole('button', { name: /^force start$/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /request force start/i }),
    ).toBeNull()
  })

  it('leaves the request door to the `user`, who holds no direct key', () => {
    renderWithProviders(
      <ForceStart
        target="task"
        id={SEED_IDS.P1_TASK_STRUCTURE}
        name="Estructura"
      />,
      { store: storeWithRole(5) },
    )

    expect(
      screen.getByRole('button', { name: /request force start/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^force start$/i })).toBeNull()
  })

  it('overrides an activity through the task endpoint, with an empty body', async () => {
    const calls: { url: string; body: unknown }[] = []
    server.use(
      http.post('*/v1/tasks/:taskId/force-start', async ({ request }) => {
        calls.push({
          url: new URL(request.url).pathname,
          body: await request.json(),
        })
        return HttpResponse.json({
          ...seedTaskDTO(SEED_IDS.P1_TASK_STRUCTURE),
          is_blocked: false,
          at_risk: true,
        })
      }),
    )

    renderWithProviders(
      <ForceStart
        target="task"
        id={SEED_IDS.P1_TASK_STRUCTURE}
        name="Estructura"
      />,
      { store: storeWithRole(3) },
    )

    await confirmDirect()

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].url).toBe(
      `/v1/tasks/${SEED_IDS.P1_TASK_STRUCTURE}/force-start`,
    )
    expect(calls[0].body).toEqual({})
  })

  it('overrides a subactivity through the subtask endpoint', async () => {
    const urls: string[] = []
    server.use(
      http.post('*/v1/tasks/subtasks/:subtaskId/force-start', ({ request }) => {
        urls.push(new URL(request.url).pathname)
        return HttpResponse.json({
          ...seedSubtaskDTO(SEED_IDS.P1_SUB_EXCAVATION),
          is_blocked: false,
          at_risk: true,
        })
      }),
    )

    renderWithProviders(
      <ForceStart
        target="subtask"
        id={SEED_IDS.P1_SUB_EXCAVATION}
        name="Excavación"
      />,
      { store: storeWithRole(3) },
    )

    await confirmDirect()

    await waitFor(() => expect(urls).toHaveLength(1))
    expect(urls[0]).toBe(
      `/v1/tasks/subtasks/${SEED_IDS.P1_SUB_EXCAVATION}/force-start`,
    )
  })

  // Toasts render through the app-level <Toaster/>, which isn't mounted here.
  it('says what the backend 400 means instead of a generic failure', async () => {
    const errorToast = vi.spyOn(toast, 'error')
    server.use(
      http.post('*/v1/tasks/:taskId/force-start', () =>
        HttpResponse.json(
          { detail: 'Task … is not blocked; nothing to force-start' },
          { status: 400 },
        ),
      ),
    )

    renderWithProviders(
      <ForceStart
        target="task"
        id={SEED_IDS.P1_TASK_STRUCTURE}
        name="Estructura"
      />,
      { store: storeWithRole(3) },
    )

    await confirmDirect()

    await waitFor(() => expect(errorToast).toHaveBeenCalled())
    expect(errorToast.mock.calls[0][0]).toMatch(/no longer blocked/i)
    errorToast.mockRestore()
  })
})
