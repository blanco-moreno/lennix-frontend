/**
 * Two rules under test.
 *
 * The panel lists the links of the row the URL asked for — the phase when a
 * phase was asked for, the subactivity when a subactivity was, and never one
 * standing in for the other. That distinction is invisible in the UI (both open
 * the same card, titled with the phase), so it lives or dies here.
 *
 * And the picker never offers a link the backend would refuse — the inverse of
 * an existing edge is there, disabled, saying why, instead of earning a 409.
 */

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { TaskDependencies } from './task-dependencies'

const PROJECT = SEED_IDS.PROJECT_TORRE_ID

// Seeded inter-phase chain: Cimentacion → Estructura → Instalaciones.
const PHASE = SEED_IDS.P1_TASK_STRUCTURE
// Seeded intra-phase chain inside Cimentacion:
// Excavacion → Cimentacion profunda → Impermeabilizacion.
const SUBACTIVITY = SEED_IDS.P1_SUB_DEEP_FOUNDATION

function renderDependencies(
  taskId: string,
  title: string,
  level: 'task' | 'subtask' = 'task',
  variant: 'drawer' | 'page' = 'page',
) {
  const store = makeStore()
  // Admin, so `project.dependencies.manage` is granted and the edge controls
  // render.
  store.dispatch(
    setUser({
      userId: SEED_IDS.USER_CARLOS_ID,
      email: 'carlos.rodriguez@lennix-test.com',
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
    <TaskDependencies
      projectId={PROJECT}
      taskId={taskId}
      taskTitle={title}
      level={level}
      variant={variant}
    />,
    { store },
  )
}

/** Opens the composer on the "waits for" list and returns its picker menu. */
async function openUpstreamPicker(user: ReturnType<typeof userEvent.setup>) {
  const buttons = await screen.findAllByTestId('dependency-add-open')
  await user.click(buttons[0])
  const composer = await screen.findByTestId('link-composer')
  await user.click(within(composer).getByRole('combobox'))
  return screen.findAllByRole('option')
}

describe('TaskDependencies', () => {
  it('splits a phase’s links into what it waits for and what it blocks', async () => {
    renderDependencies(PHASE, 'Estructura')

    expect(await screen.findByText('Waits for (1)')).toBeInTheDocument()
    expect(screen.getByText('Blocks (1)')).toBeInTheDocument()
    // Each list names the *other* end — the pivot card already names this one.
    // Scoped to the two lists: the chain's mini-Gantt below them draws the
    // same neighbours as bars, so an unscoped match would prove nothing about
    // which side named which row.
    const [waitsFor, blocks] = screen.getAllByTestId('dependency-editor')
    expect(within(waitsFor).getByText('Cimentacion')).toBeInTheDocument()
    expect(within(blocks).getByText('Instalaciones')).toBeInTheDocument()
  })

  it('lists the subactivity’s own links, not its phase’s', async () => {
    renderDependencies(
      SUBACTIVITY,
      'Cimentacion profunda y estructura',
      'subtask',
    )

    // Its level: excavation before it, waterproofing after it.
    await screen.findAllByTestId('dependency-edge-row')
    const [waitsFor, blocks] = screen.getAllByTestId('dependency-editor')
    expect(
      within(waitsFor).getByText('Excavacion para cimentacion'),
    ).toBeInTheDocument()
    expect(within(blocks).getByText('Impermeabilizacion')).toBeInTheDocument()
    // The parent phase's own chain belongs to the parent, and stays there.
    expect(screen.queryByText('Instalaciones')).not.toBeInTheDocument()
  })

  it('pivots the chain on the row the URL asked for', async () => {
    renderDependencies(
      SUBACTIVITY,
      'Cimentacion profunda y estructura',
      'subtask',
    )

    const pivot = await screen.findByTestId('dependency-pivot')
    expect(pivot).toHaveTextContent('Cimentacion profunda y estructura')
    expect(pivot).toHaveTextContent('Subactivity')
  })

  it('says in construction language, with PDM as the secondary chip', async () => {
    const user = userEvent.setup()
    renderDependencies(PHASE, 'Estructura')

    const rows = await screen.findAllByTestId('dependency-edge-row')
    expect(screen.getAllByText('FS').length).toBeGreaterThan(0)

    await user.click(rows[0])
    // In the opened row, not anywhere: the mini-Gantt's legend spells the same
    // four relationships out, and it is not what this asserts.
    const detail = screen.getByTestId('dependency-edge-detail')
    expect(
      within(detail).getByText('starts when the other finishes'),
    ).toBeInTheDocument()
  })

  it('says a row has no links at all, once, with the way out', async () => {
    // Two empty lists said the same nothing twice and offered no reason to
    // care. One empty state names what the absence costs.
    renderDependencies('not-in-this-project', 'Nada')

    expect(await screen.findByText('No dependencies')).toBeInTheDocument()
    expect(screen.queryAllByTestId('dependency-editor')).toHaveLength(0)
  })

  it('keeps a link that would loop on offer, disabled, with the reason', async () => {
    const user = userEvent.setup()
    renderDependencies(PHASE, 'Estructura')

    const options = await openUpstreamPicker(user)
    const at = (name: string) =>
      options.find((option) => option.textContent?.includes(name))

    // The seeded project is a straight chain:
    // Cimentacion → Estructura → Instalaciones → Terminaciones → Entrega.
    // Instalaciones already waits on this phase, so making this phase wait on
    // it closes a two-row loop. The row stays and says so, rather than being
    // offered as legal and refused by the server after the click.
    expect(at('Instalaciones')).toHaveTextContent('Already waits for this one')
    expect(at('Instalaciones')).toHaveAttribute('aria-disabled', 'true')
    // Further down the same chain the loop is longer, so the reason names the
    // hop that proves it rather than asserting a relationship you cannot see.
    expect(at('Terminaciones')).toHaveTextContent(
      'Would create a loop, via Instalaciones',
    )
    // The edge that already exists says the other thing.
    expect(at('Cimentacion')).toHaveTextContent('Already linked')
    // And a phase outside the chain is plain, linkable.
    expect(at('Montaje de Fachada')).not.toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('creates the link with its type and lag in one act', async () => {
    const user = userEvent.setup()
    renderDependencies(PHASE, 'Estructura')

    const options = await openUpstreamPicker(user)
    await user.click(
      options.find((option) =>
        option.textContent?.includes('Montaje de Fachada'),
      )!,
    )

    const composer = screen.getByTestId('link-composer')
    await user.click(within(composer).getByRole('button', { name: /^SS/ }))
    const lag = within(composer).getByLabelText(/Lag/)
    await user.clear(lag)
    await user.type(lag, '3')

    const created: { taskId: string; body: unknown }[] = []
    server.use(
      http.post(
        '*/v1/tasks/:taskId/dependencies',
        async ({ params, request }) => {
          created.push({
            taskId: String(params.taskId),
            body: await request.json(),
          })
          return new HttpResponse(null, { status: 201 })
        },
      ),
    )

    await user.click(screen.getByTestId('dependency-add-submit'))

    // Upstream: the picked row is the predecessor, this row the successor —
    // and the PDM shape rides along instead of needing a second PATCH.
    await waitFor(() => expect(created).toHaveLength(1))
    expect(created[0].taskId).toBe(PHASE)
    expect(created[0].body).toMatchObject({
      depends_on_id: SEED_IDS.P1_TASK_FORCE_STARTED,
      dependency_type: 'inter_phase',
      relationship_type: 'SS',
      lag_days: 3,
    })
  })

  it('drops the pivot card and the chart in the drawer, and nothing else', async () => {
    // One grammar wherever the graph is read. The drawer sits on top of the
    // full Gantt, which already draws these bars, and its own title already
    // names the row — so both are repeat, and repeat costs scroll.
    const { unmount } = renderDependencies(PHASE, 'Estructura')
    expect(await screen.findByTestId('dependency-timeline')).toBeInTheDocument()
    expect(screen.getByTestId('dependency-pivot')).toBeInTheDocument()
    expect(screen.getAllByTestId('dependency-add-open')).toHaveLength(2)
    unmount()

    renderDependencies(PHASE, 'Estructura', 'task', 'drawer')
    await screen.findByText('Waits for (1)')
    expect(screen.getAllByTestId('dependency-add-open')).toHaveLength(2)
    expect(screen.queryByTestId('dependency-timeline')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dependency-pivot')).not.toBeInTheDocument()
  })
})
