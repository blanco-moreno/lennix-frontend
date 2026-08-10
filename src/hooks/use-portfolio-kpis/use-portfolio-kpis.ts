import { useMemo } from 'react'

import { useGetOrgDashboardQuery } from '@/services/analytics'
import { useGetMeQuery } from '@/services/auth'
import { buildPortfolioKpis, type HeroKpi } from '@/utils'

export interface HeroKpiState {
  kpis: HeroKpi[]
  isLoading: boolean
  hasError: boolean
}

/**
 * The portfolio hero KPIs, from the ONE org-dashboard query.
 *
 * The aggregation is the backend's: deriving these in the browser could only
 * ever be page-scoped (the task list is paginated), and a KPI that silently
 * describes one page of a portfolio is worse than no KPI.
 */
export function usePortfolioKpis(): HeroKpiState {
  const { data: me } = useGetMeQuery()
  const organizationId = me?.organizationId ?? ''
  const {
    data: dashboard,
    isLoading,
    error,
  } = useGetOrgDashboardQuery(organizationId, { skip: !organizationId })

  const kpis = useMemo(() => buildPortfolioKpis(dashboard), [dashboard])

  return {
    kpis,
    isLoading: isLoading || !organizationId,
    hasError: Boolean(error),
  }
}
