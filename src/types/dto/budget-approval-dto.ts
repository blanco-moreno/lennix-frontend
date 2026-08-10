/**
 * DTOs mirroring `app/budget_approvals/schemas.py` on the backend.
 * Field names use snake_case here (raw API shape); the domain types
 * in `@/types/budget-approval` are camelCase.
 */

export type BudgetApprovalTargetDTO = 'project' | 'task'
export type BudgetApprovalStateDTO = 'pending' | 'approved' | 'rejected'

export interface BudgetApprovalResponseDTO {
  id: string
  target_type: BudgetApprovalTargetDTO
  target_id: string
  /** Numeric(12,2) — serialised by Pydantic as a string. */
  requested_amount: string
  /** Null when the target had no budget set before the request. */
  previous_amount: string | null
  reason: string
  state: BudgetApprovalStateDTO
  requestor_id: string
  decided_by: string | null
  decided_at: string | null
  decision_comment: string | null
  /** Audit snapshot taken at request time. Shape varies by target_type. */
  state_snapshot: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface BudgetApprovalCreateRequestDTO {
  target_type: BudgetApprovalTargetDTO
  target_id: string
  requested_amount: string
  reason: string
}

export interface BudgetApprovalDecideRequestDTO {
  decision_comment: string | null
}
