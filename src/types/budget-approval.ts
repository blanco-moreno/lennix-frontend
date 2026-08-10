export type BudgetApprovalTarget = 'project' | 'task'
export type BudgetApprovalState = 'pending' | 'approved' | 'rejected'

export interface BudgetApproval {
  id: string
  targetType: BudgetApprovalTarget
  targetId: string
  /** Stored as Decimal(12,2) on the backend; kept as a string here
   *  so we never lose precision in float conversions. Format with
   *  `formatMoney()` at the call site. */
  requestedAmount: string
  previousAmount: string | null
  reason: string
  state: BudgetApprovalState
  requestorId: string
  decidedBy: string | null
  decidedAt: string | null
  decisionComment: string | null
  stateSnapshot: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface BudgetApprovalCreateInput {
  targetType: BudgetApprovalTarget
  targetId: string
  requestedAmount: string
  reason: string
}

export interface BudgetApprovalListFilters {
  state?: BudgetApprovalState
  targetType?: BudgetApprovalTarget
  targetId?: string
}
