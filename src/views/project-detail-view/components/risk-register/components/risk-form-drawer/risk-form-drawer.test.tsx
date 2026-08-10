/**
 * The risk create/edit form. `risk-register.test.tsx` already covers the
 * empty-title refusal and the default-axes create body through the register;
 * these pin what only the modal itself owns — trim-to-null on the optional
 * fields, the edit path (prefill + PUT), and the suggestion prefill.
 */

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { Risk } from '@/types'
import type { RiskResponseDTO } from '@/types/dto/risk-dto'

import { RiskFormDrawer } from './risk-form-drawer'

const PROJECT_ID = SEED_IDS.PROJECT_TORRE_ID

/**
 * The `lennix_pro` seed carries a risk register but `pnpm seed:sync` only
 * extracts its ids so far — so the rows are built on the seed's own ids to
 * keep at least the identifiers real (same stance as `risk-register.test.tsx`).
 */
const EXISTING_RISK: Risk = {
  id: SEED_IDS.RISK_P1_STRUCTURAL,
  projectId: PROJECT_ID,
  title: 'Atraso en la entrega del acero estructural',
  description: 'El proveedor confirma dos semanas de retraso',
  category: 'Suministro',
  probability: 'high',
  impact: 'high',
  score: 9,
  responseStrategy: 'mitigate',
  mitigation: 'Cotizar un segundo proveedor',
  ownerId: null,
  status: 'mitigating',
  linkedTaskId: null,
  identifiedAt: '2026-07-01T00:00:00Z',
  createdAt: '2026-07-01T00:00:00Z',
  updatedAt: '2026-07-01T00:00:00Z',
}

function riskResponseDTO(): RiskResponseDTO {
  return {
    id: EXISTING_RISK.id,
    project_id: PROJECT_ID,
    title: EXISTING_RISK.title,
    description: null,
    category: null,
    probability: 'high',
    impact: 'high',
    score: 9,
    response_strategy: null,
    mitigation: null,
    owner_id: null,
    status: 'open',
    linked_task_id: null,
    identified_at: '2026-07-01T00:00:00Z',
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
  }
}

function renderModal({
  risk = null,
  initialTitle,
  onOpenChange = () => undefined,
}: {
  risk?: Risk | null
  initialTitle?: string
  onOpenChange?: (open: boolean) => void
} = {}) {
  return renderWithProviders(
    <RiskFormDrawer
      projectId={PROJECT_ID}
      projectName="Test Project"
      risk={risk}
      initialTitle={initialTitle}
      open
      onOpenChange={onOpenChange}
    />,
    { store: makeStore() },
  )
}

describe('RiskFormDrawer', () => {
  it('trims the optional fields to null instead of posting empty strings', async () => {
    const bodies: unknown[] = []
    const onOpenChange = vi.fn()
    server.use(
      http.post('*/v1/risks', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json(riskResponseDTO(), { status: 201 })
      }),
    )

    renderModal({ onOpenChange })
    const dialog = await screen.findByRole('dialog')

    await userEvent.type(
      within(dialog).getByLabelText('Risk'),
      '  Atraso en la entrega del acero estructural  ',
    )
    // Whitespace-only optional fields must not survive as ' ' in the register.
    await userEvent.type(within(dialog).getByLabelText('Mitigation plan'), ' ')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Save risk' }),
    )

    await waitFor(() => {
      expect(bodies).toEqual([
        {
          project_id: PROJECT_ID,
          title: 'Atraso en la entrega del acero estructural',
          description: null,
          category: null,
          probability: 'medium',
          impact: 'medium',
          response_strategy: null,
          mitigation: null,
          status: 'open',
        },
      ])
    })
    // The backend derives the score; the form never sends one.
    expect(bodies[0]).not.toHaveProperty('score')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('refuses a whitespace-only title without touching the network', async () => {
    const bodies: unknown[] = []
    server.use(
      http.post('*/v1/risks', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json(riskResponseDTO(), { status: 201 })
      }),
    )

    renderModal()
    const dialog = await screen.findByRole('dialog')

    await userEvent.type(within(dialog).getByLabelText('Risk'), '   ')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Save risk' }),
    )

    expect(
      await within(dialog).findByText('Describe the risk in one line'),
    ).toBeInTheDocument()
    expect(bodies).toHaveLength(0)
  })

  it('prefills every field in edit mode and PUTs to the risk, preserving what was not touched', async () => {
    const puts: { riskId: string; body: unknown }[] = []
    server.use(
      http.put('*/v1/risks/:riskId', async ({ params, request }) => {
        puts.push({ riskId: String(params.riskId), body: await request.json() })
        return HttpResponse.json(riskResponseDTO())
      }),
    )

    renderModal({ risk: EXISTING_RISK })
    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).getByText('Edit risk')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Risk')).toHaveValue(
      EXISTING_RISK.title,
    )
    expect(within(dialog).getByLabelText('Description')).toHaveValue(
      'El proveedor confirma dos semanas de retraso',
    )

    await userEvent.type(within(dialog).getByLabelText('Risk'), ' (rev 2)')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Save risk' }),
    )

    await waitFor(() => {
      expect(puts).toEqual([
        {
          riskId: SEED_IDS.RISK_P1_STRUCTURAL,
          body: {
            title: 'Atraso en la entrega del acero estructural (rev 2)',
            description: 'El proveedor confirma dos semanas de retraso',
            category: 'Suministro',
            probability: 'high',
            impact: 'high',
            response_strategy: 'mitigate',
            mitigation: 'Cotizar un segundo proveedor',
            status: 'mitigating',
          },
        },
      ])
    })
  })

  it('carries a suggested title into the form', async () => {
    renderModal({ initialTitle: 'Hormigonado 5 days late' })
    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).getByText('New risk')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Risk')).toHaveValue(
      'Hormigonado 5 days late',
    )
  })
})
