import { useMemo } from 'react'

import { useGetDependencyChainsQuery } from '@/services/task'
import type { DependencyNode } from '@/types'

/**
 * Every edge of a project as one flat list — inter-phase and intra-phase
 * together. Read a row's blockers from a slice (say, one parent's
 * `intraPhase`) and an edge that lives on the other side comes back as "no
 * predecessor", which reads as a dead link. The query is cached per project,
 * so N rows of the same obra share one request.
 */
export function useProjectEdges(projectId: string) {
  const { data: chains, isLoading } = useGetDependencyChainsQuery(projectId)
  const edges = useMemo<DependencyNode[]>(
    () =>
      chains
        ? [...chains.interPhase, ...Object.values(chains.intraPhase).flat()]
        : [],
    [chains],
  )
  return { edges, isLoading }
}
