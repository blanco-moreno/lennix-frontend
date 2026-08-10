/**
 * The seed carries no budget-approval rows (approvals are runtime events), so
 * the DTO here is assembled from seed facts — the Torre project and its real
 * seeded budget — with the test-only values named `FIXTURE_*`.
 */

import { FIXTURE_CREATED_AT, seedProject } from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'
import type { BudgetApprovalResponseDTO } from '@/types/dto/budget-approval-dto'

import { mapBudgetApprovalResponseDTOToBudgetApproval } from './budget-approval-mapper'

/** Test-only request id — approvals mint ids at runtime, not in the seed. */
const FIXTURE_APPROVAL_ID = 'f7000000-0001-0001-0000-000000000000'
const FIXTURE_DECIDED_AT = '2026-07-24T15:00:00Z'

function approvalDTO(
  overrides: Partial<BudgetApprovalResponseDTO> = {},
): BudgetApprovalResponseDTO {
  const project = seedProject(SEED_IDS.PROJECT_TORRE_ID)
  return {
    id: FIXTURE_APPROVAL_ID,
    target_type: 'project',
    target_id: project.id,
    requested_amount: '900000.00',
    // The target's real seeded budget, as Pydantic serialises Numeric(12,2).
    previous_amount: Number(project.budget).toFixed(2),
    reason: 'Sobrecosto de materiales estructurales',
    state: 'approved',
    requestor_id: SEED_IDS.USER_FERNANDO_ID,
    decided_by: SEED_IDS.USER_MIGUEL_ID,
    decided_at: FIXTURE_DECIDED_AT,
    decision_comment: 'Aprobado con cargo a contingencia',
    state_snapshot: { name: project.name, budget: project.budget },
    created_at: FIXTURE_CREATED_AT,
    updated_at: FIXTURE_CREATED_AT,
    ...overrides,
  }
}

describe('mapBudgetApprovalResponseDTOToBudgetApproval', () => {
  it('maps a decided request field by field', () => {
    const dto = approvalDTO()

    const approval = mapBudgetApprovalResponseDTOToBudgetApproval(dto)

    expect(approval.id).toBe(FIXTURE_APPROVAL_ID)
    expect(approval.targetType).toBe('project')
    expect(approval.targetId).toBe(SEED_IDS.PROJECT_TORRE_ID)
    expect(approval.requestedAmount).toBe('900000.00')
    expect(approval.previousAmount).toBe('850000.00')
    expect(approval.reason).toBe(dto.reason)
    expect(approval.state).toBe('approved')
    expect(approval.requestorId).toBe(SEED_IDS.USER_FERNANDO_ID)
    expect(approval.decidedBy).toBe(SEED_IDS.USER_MIGUEL_ID)
    expect(approval.decidedAt).toBe(FIXTURE_DECIDED_AT)
    expect(approval.decisionComment).toBe(dto.decision_comment)
    expect(approval.stateSnapshot).toEqual(dto.state_snapshot)
    expect(approval.createdAt).toBe(dto.created_at)
    expect(approval.updatedAt).toBe(dto.updated_at)
  })

  it('does not swap the two amounts', () => {
    const approval = mapBudgetApprovalResponseDTOToBudgetApproval(approvalDTO())

    expect(Number(approval.requestedAmount)).toBeGreaterThan(
      Number(approval.previousAmount),
    )
  })

  it('keeps a pending request undecided (null decision fields)', () => {
    const approval = mapBudgetApprovalResponseDTOToBudgetApproval(
      approvalDTO({
        state: 'pending',
        decided_by: null,
        decided_at: null,
        decision_comment: null,
        // A target that had no budget before the request.
        previous_amount: null,
      }),
    )

    expect(approval.state).toBe('pending')
    expect(approval.decidedBy).toBeNull()
    expect(approval.decidedAt).toBeNull()
    expect(approval.decisionComment).toBeNull()
    expect(approval.previousAmount).toBeNull()
  })
})

describe('page of approvals', () => {
  it('maps one page one to one through the item mapper', () => {
    const dtos = [approvalDTO(), approvalDTO({ state: 'rejected' })]

    const approvals = dtos.map(mapBudgetApprovalResponseDTOToBudgetApproval)

    expect(approvals).toHaveLength(2)
    expect(approvals[0].state).toBe('approved')
    expect(approvals[1].state).toBe('rejected')
  })
})
