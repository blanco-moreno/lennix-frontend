import { useMemo } from 'react'

import { useGetProjectDashboardQuery } from '@/services/analytics'
import { buildProjectKpis } from '@/utils'

import type { HeroKpiState } from '../use-portfolio-kpis'

/**
 * The project hero KPIs — the same two schedule signals the portfolio shows,
 * scoped to one project, from the query the project screen already runs.
 */
export function useProjectKpis(projectId: string): HeroKpiState {
  const {
    data: dashboard,
    isLoading,
    error,
  } = useGetProjectDashboardQuery(projectId, { skip: !projectId })

  const kpis = useMemo(() => buildProjectKpis(dashboard), [dashboard])

  return {
    kpis,
    isLoading: isLoading || !projectId,
    hasError: Boolean(error),
  }
}
