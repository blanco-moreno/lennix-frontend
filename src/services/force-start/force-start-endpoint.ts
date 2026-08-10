import { MAX_PAGE_SIZE } from '@/constants'
import type { ForceStartListFilters } from '@/types'

const BASE = '/v1/force-start-requests'

export function listForceStartRequests(
  filters: ForceStartListFilters = {},
): string {
  const params = new URLSearchParams()
  if (filters.state) params.set('state', filters.state)
  if (filters.taskId) params.set('task_id', filters.taskId)
  // The bandeja renders one page at the backend's ceiling; `total` still
  // carries the true count for the badge.
  params.set('page_size', String(MAX_PAGE_SIZE))
  return `${BASE}?${params.toString()}`
}

export const createForceStartRequest = BASE

export function approveForceStartRequest(id: string): string {
  return `${BASE}/${id}/approve`
}

export function rejectForceStartRequest(id: string): string {
  return `${BASE}/${id}/reject`
}
