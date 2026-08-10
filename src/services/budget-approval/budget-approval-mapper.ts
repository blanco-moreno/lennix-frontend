import type { BudgetApproval } from '@/types'
import type { BudgetApprovalResponseDTO } from '@/types/dto/budget-approval-dto'

export function mapBudgetApprovalResponseDTOToBudgetApproval(
  dto: BudgetApprovalResponseDTO,
): BudgetApproval {
  return {
    id: dto.id,
    targetType: dto.target_type,
    targetId: dto.target_id,
    requestedAmount: dto.requested_amount,
    previousAmount: dto.previous_amount,
    reason: dto.reason,
    state: dto.state,
    requestorId: dto.requestor_id,
    decidedBy: dto.decided_by,
    decidedAt: dto.decided_at,
    decisionComment: dto.decision_comment,
    stateSnapshot: dto.state_snapshot,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}
