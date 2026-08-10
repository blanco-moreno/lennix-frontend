import type { RiskListFilters } from '@/types'

const BASE = '/v1/risks'

export function listRisks(filters: RiskListFilters): string {
  const params = new URLSearchParams({ project_id: filters.projectId })
  if (filters.status) params.set('status', filters.status)
  // The register is a per-project working list, not an archive: one page as
  // wide as the backend allows (MAX_PAGE_SIZE = 20) beats a pager nobody
  // would use on a dozen rows.
  params.set('page_size', '20')
  return `${BASE}?${params.toString()}`
}

export function listRiskSuggestions(projectId: string): string {
  return `${BASE}/suggestions?project_id=${projectId}`
}

export const createRisk = BASE

export function riskById(riskId: string): string {
  return `${BASE}/${riskId}`
}
