import { MAX_PAGE_SIZE } from '@/constants'
import type { BudgetApprovalListFilters } from '@/types'

const BASE = '/v1/budget-approvals'

export function listApprovals(filters: BudgetApprovalListFilters = {}): string {
  const params = new URLSearchParams()
  if (filters.state) params.set('state', filters.state)
  if (filters.targetType) params.set('target_type', filters.targetType)
  if (filters.targetId) params.set('target_id', filters.targetId)
  // The bandeja renders one page at the backend's ceiling; `total` still
  // carries the true count for the badge.
  params.set('page_size', String(MAX_PAGE_SIZE))
  return `${BASE}?${params.toString()}`
}

// No trailing slash: the backend registers these at `""` under the
// `/v1/budget-approvals` prefix, so `/v1/budget-approvals/` only earns a 307
// and a second round trip. `/v1/force-start-requests` never had one.
export const createApproval = BASE

export function approveApproval(id: string): string {
  return `${BASE}/${id}/approve`
}

export function rejectApproval(id: string): string {
  return `${BASE}/${id}/reject`
}
