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

import { BudgetApprovalDecideDialog } from './budget-approval-decide-dialog'

/** Requests are not seeded; the id is a fixture concern. */
const FIXTURE_REQUEST_ID = 'e1000000-0000-0001-0000-000000000000'

function decidedDTO(
  state: 'approved' | 'rejected',
  decisionComment: string | null,
): BudgetApprovalResponseDTO {
  const project = seedProject(SEED_IDS.PROJECT_TORRE_ID)
  return {
    id: FIXTURE_REQUEST_ID,
    target_type: 'project',
    target_id: project.id,
    requested_amount: '900000.00',
    previous_amount: requiredDecimal(project.budget),
    reason: 'Steel prices went up after the Q3 tender.',
    state,
    requestor_id: SEED_IDS.USER_MIGUEL_ID,
    decided_by: SEED_IDS.USER_CARLOS_ID,
    decided_at: FIXTURE_CREATED_AT,
    decision_comment: decisionComment,
    state_snapshot: { name: project.name },
    created_at: FIXTURE_CREATED_AT,
    updated_at: FIXTURE_CREATED_AT,
  }
}

/** Records the decision endpoint hit for one verb. */
function captureDecision(verb: 'approve' | 'reject') {
  const calls: { id: string; body: Record<string, unknown> }[] = []
  server.use(
    http.post(
      `*/v1/budget-approvals/:requestId/${verb}`,
      async ({ params, request }) => {
        calls.push({
          id: String(params.requestId),
          body: (await request.json()) as Record<string, unknown>,
        })
        return HttpResponse.json(
          decidedDTO(
            verb === 'approve' ? 'approved' : 'rejected',
            (calls[calls.length - 1].body.decision_comment as string | null) ??
              null,
          ),
        )
      },
    ),
  )
  return calls
}

function renderDialog(
  mode: 'approve' | 'reject',
  onClose: () => void = () => {},
) {
  return renderWithProviders(
    <BudgetApprovalDecideDialog
      requestId={FIXTURE_REQUEST_ID}
      mode={mode}
      onClose={onClose}
    />,
    { store: makeStore() },
  )
}

describe('BudgetApprovalDecideDialog', () => {
  it('approves with the optional note in the decision body', async () => {
    const calls = captureDecision('approve')
    const onClose = vi.fn()
    renderDialog('approve', onClose)

    // The label carries no htmlFor, so the textarea is reached by its
    // placeholder — still the copy the approver actually sees.
    await userEvent.type(
      await screen.findByPlaceholderText('Leave a note for the requestor…'),
      'Within the revised ceiling.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Approve' }))

    await waitFor(() => {
      expect(calls).toHaveLength(1)
    })
    expect(calls[0].id).toBe(FIXTURE_REQUEST_ID)
    expect(calls[0].body).toEqual({
      decision_comment: 'Within the revised ceiling.',
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('rejects without a note as an explicit null comment', async () => {
    const calls = captureDecision('reject')
    renderDialog('reject')

    await userEvent.click(await screen.findByRole('button', { name: 'Reject' }))

    await waitFor(() => {
      expect(calls).toHaveLength(1)
    })
    expect(calls[0].id).toBe(FIXTURE_REQUEST_ID)
    expect(calls[0].body).toEqual({ decision_comment: null })
  })
})
