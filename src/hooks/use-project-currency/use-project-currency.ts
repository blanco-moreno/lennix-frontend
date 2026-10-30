import { useCallback } from 'react'
import { useParams } from 'react-router'

import { useGetProjectQuery } from '@/services/project'
import type { ProjectCurrency } from '@/types'
import { DEFAULT_CURRENCY, formatMoney } from '@/utils'

export interface ProjectMoney {
  /** ISO 4217 code every amount of the project is in (ms-bk `BUD-10`). */
  currency: ProjectCurrency
  /** `formatMoney` bound to that currency. */
  formatMoney: (value: number | string | null | undefined) => string
}

/**
 * The currency of a project, and a formatter bound to it.
 *
 * Reads the project the route names (`/projects/:projectId/...`) unless an id
 * is passed. The project page already fetched it, so this is a cache hit, not
 * a second request. Until it arrives, and outside a project, amounts read in
 * USD: what every project held before the currency existed.
 */
export function useProjectCurrency(projectId?: string): ProjectMoney {
  const params = useParams<{ projectId?: string }>()
  const id = projectId ?? params.projectId
  const { data: project } = useGetProjectQuery(id ?? '', { skip: !id })
  const currency = project?.currency ?? DEFAULT_CURRENCY
  const format = useCallback(
    (value: number | string | null | undefined) => formatMoney(value, currency),
    [currency],
  )
  return { currency, formatMoney: format }
}
