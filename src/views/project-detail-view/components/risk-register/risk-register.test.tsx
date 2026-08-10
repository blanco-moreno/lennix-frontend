import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { RiskResponseDTO } from '@/types/dto/risk-dto'

import { RiskRegister } from './risk-register'

const PROJECT_ID = SEED_IDS.PROJECT_TORRE_ID

/**
 * The `lennix_pro` seed does carry a risk register (`14_risks.py`), but the
 * frontend seed mirror only picked up its ids — `pnpm seed:sync` does not
 * extract that module yet. Until it does, these rows are built from the seed's
 * own ids so at least the identifiers stay real.
 */
function riskDTO(overrides: Partial<RiskResponseDTO> = {}): RiskResponseDTO {
  return {
    id: SEED_IDS.RISK_P1_STRUCTURAL,
    project_id: PROJECT_ID,
    title: 'Atraso en la entrega del acero estructural',
    description: null,
    category: null,
    probability: 'high',
    impact: 'high',
    score: 9,
    response_strategy: 'mitigate',
    mitigation: null,
    owner_id: null,
    status: 'open',
    linked_task_id: null,
    identified_at: '2026-07-01T00:00:00Z',
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
    ...overrides,
  }
}

function serveRisks(rows: RiskResponseDTO[]) {
  server.use(
    http.get('*/v1/risks', ({ request }) => {
      if (new URL(request.url).pathname.endsWith('/suggestions')) {
        return HttpResponse.json([])
      }
      return HttpResponse.json({
        items: rows,
        total: rows.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
      })
    }),
  )
}

/** Role ids: 1 owner, 5 user. */
function renderRegister(roleId = 1) {
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
    <RiskRegister projectId={PROJECT_ID} projectName="Test Project" />,
    {
      store,
      route: `/projects/${PROJECT_ID}?tab=risks`,
    },
  )
}

describe('RiskRegister', () => {
  it('renders the full 3x3 matrix, empty cells included', async () => {
    serveRisks([])
    renderRegister()

    // Nine cells, always — a matrix with holes is not a matrix.
    const cells = await screen.findAllByRole('button', { name: /risks? —/i })
    expect(cells).toHaveLength(9)
    expect(
      screen.getByRole('button', {
        name: /0 risks — probability High, impact High/i,
      }),
    ).toBeInTheDocument()
  })

  it('counts each risk in its own probability × impact cell', async () => {
    serveRisks([
      riskDTO(),
      riskDTO({
        id: SEED_IDS.RISK_P1_WEATHER,
        probability: 'low',
        impact: 'medium',
        score: 2,
      }),
    ])
    renderRegister()

    expect(
      await screen.findByRole('button', {
        name: /1 risk — probability High, impact High/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /1 risk — probability Low, impact Medium/i,
      }),
    ).toBeInTheDocument()
  })

  it('filters the list to the cell you click, and back', async () => {
    serveRisks([
      riskDTO(),
      riskDTO({
        id: SEED_IDS.RISK_P1_WEATHER,
        title: 'Lluvias',
        probability: 'low',
        impact: 'medium',
      }),
    ])
    renderRegister()

    await screen.findByText('Lluvias')

    await userEvent.click(
      screen.getByRole('button', {
        name: /1 risk — probability High, impact High/i,
      }),
    )
    await waitFor(() => {
      expect(screen.queryByText('Lluvias')).toBeNull()
    })
    expect(
      screen.getByText('Atraso en la entrega del acero estructural'),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /show all/i }))
    expect(await screen.findByText('Lluvias')).toBeInTheDocument()
  })

  it('registers a risk without ever asking for its score', async () => {
    const bodies: unknown[] = []
    serveRisks([])
    server.use(
      http.post('*/v1/risks', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json(riskDTO(), { status: 201 })
      }),
    )

    renderRegister()

    await userEvent.click(
      await screen.findByRole('button', { name: /add risk/i }),
    )
    const dialog = await screen.findByRole('dialog')

    // The score is derived server-side from the two axes — a second place
    // computing it is a second place to get it wrong.
    expect(within(dialog).queryByLabelText(/score/i)).toBeNull()

    await userEvent.type(
      within(dialog).getByLabelText(/^risk$/i),
      'Atraso en la entrega del acero estructural',
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: /save risk/i }),
    )

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0]).toMatchObject({
      project_id: PROJECT_ID,
      title: 'Atraso en la entrega del acero estructural',
      probability: 'medium',
      impact: 'medium',
      status: 'open',
    })
  })

  it('refuses to register a risk with no description of what it is', async () => {
    const bodies: unknown[] = []
    serveRisks([])
    server.use(
      http.post('*/v1/risks', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json(riskDTO(), { status: 201 })
      }),
    )

    renderRegister()

    await userEvent.click(
      await screen.findByRole('button', { name: /add risk/i }),
    )
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: /save risk/i }),
    )

    expect(
      await within(dialog).findByText(/describe the risk in one line/i),
    ).toBeInTheDocument()
    expect(bodies).toHaveLength(0)
  })

  it('deletes a risk from its row', async () => {
    const deleted: string[] = []
    serveRisks([riskDTO()])
    server.use(
      http.delete('*/v1/risks/:riskId', ({ params }) => {
        deleted.push(String(params.riskId))
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderRegister()

    await userEvent.click(
      await screen.findByRole('button', { name: /delete risk/i }),
    )

    await waitFor(() => {
      expect(deleted).toEqual([SEED_IDS.RISK_P1_STRUCTURAL])
    })
  })

  it('does not restate the critical path or per-activity delay (the schedule surface owns those)', async () => {
    serveRisks([riskDTO()])
    renderRegister()

    await screen.findByText(/risk register/i)
    expect(screen.queryByText(/critical path/i)).toBeNull()
    expect(screen.queryByText(/delayed activities/i)).toBeNull()
    expect(screen.queryByText(/average delay/i)).toBeNull()
  })

  it('lets a `user` write the register of an obra they work on', async () => {
    // The register is operational, not financial: everyone on the obra keeps
    // it. Where they may do it is membership, and that is the backend's gate.
    serveRisks([riskDTO()])
    renderRegister(5)

    expect(
      await screen.findByText('Atraso en la entrega del acero estructural'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add risk/i }),
    ).toBeInTheDocument()
  })

  it('hides every write control from a role the frontend cannot resolve', async () => {
    serveRisks([riskDTO()])
    renderRegister(99)

    expect(
      await screen.findByText('Atraso en la entrega del acero estructural'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /add risk/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /edit risk/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /delete risk/i }),
    ).not.toBeInTheDocument()
  })
})
