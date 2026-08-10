import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  FIXTURE_CREATED_AT,
  requiredDecimal,
  seedProject,
} from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { BudgetApprovalResponseDTO } from '@/types/dto/budget-approval-dto'

import { BudgetApprovalRequestForm } from './budget-approval-request-form'

const FIXTURE_REASON = 'Steel prices went up after the Q3 tender.'

function createdDTO(body: Record<string, unknown>): BudgetApprovalResponseDTO {
  const project = seedProject(SEED_IDS.PROJECT_TORRE_ID)
  return {
    // Requests are not seeded; the id is a fixture concern.
    id: 'e1000000-0000-0001-0000-000000000000',
    target_type: 'project',
    target_id: project.id,
    requested_amount: String(body.requested_amount),
    previous_amount: requiredDecimal(project.budget),
    reason: String(body.reason),
    state: 'pending',
    requestor_id: SEED_IDS.USER_MIGUEL_ID,
    decided_by: null,
    decided_at: null,
    decision_comment: null,
    state_snapshot: { name: project.name },
    created_at: FIXTURE_CREATED_AT,
    updated_at: FIXTURE_CREATED_AT,
  }
}

/** Records every POST /v1/budget-approvals body the modal fires. */
function captureCreates() {
  const bodies: Record<string, unknown>[] = []
  server.use(
    http.post('*/v1/budget-approvals', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      bodies.push(body)
      return HttpResponse.json(createdDTO(body), { status: 201 })
    }),
  )
  return bodies
}

function renderModal(onOpenChange: (open: boolean) => void = () => {}) {
  const project = seedProject(SEED_IDS.PROJECT_TORRE_ID)
  return renderWithProviders(
    <BudgetApprovalRequestForm
      targetType="project"
      targetId={project.id}
      currentBudget={project.budget}
      open
      onOpenChange={onOpenChange}
    />,
    { store: makeStore() },
  )
}

describe('BudgetApprovalRequestForm', () => {
  it('prefills the amount with the target current budget', async () => {
    renderModal()

    // Torre's seeded 850000 budget, rendered by the currency input.
    expect(await screen.findByLabelText('New amount (USD)')).toHaveValue(
      '850,000.00',
    )
  })

  it('submits the new amount and justification for approval', async () => {
    const bodies = captureCreates()
    const onOpenChange = vi.fn()
    renderModal(onOpenChange)

    const amount = await screen.findByLabelText('New amount (USD)')
    await userEvent.clear(amount)
    await userEvent.type(amount, '900000')
    await userEvent.type(screen.getByLabelText('Justification'), FIXTURE_REASON)
    await userEvent.click(
      screen.getByRole('button', { name: 'Send for approval' }),
    )

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0]).toEqual({
      target_type: 'project',
      target_id: SEED_IDS.PROJECT_TORRE_ID,
      requested_amount: '900000.00',
      reason: FIXTURE_REASON,
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('requires a justification — one representative invalid case', async () => {
    renderModal()

    const reason = await screen.findByLabelText('Justification')
    await userEvent.type(reason, 'x')
    await userEvent.clear(reason)

    expect(
      await screen.findByText('The reason is required'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Send for approval' }),
    ).toBeDisabled()
  })
})
