import { useDependencyEdits } from '@/features'
import {
  useCreateDependencyMutation,
  useRemoveDependencyMutation,
} from '@/services/task'
import type { DependencyNode } from '@/types'
import { type DependencyType } from '@/utils'

interface UseEdgeActionsArgs {
  projectId: string
}

/**
 * What the schedule surface still writes itself: re-linking a broken edge and
 * discarding one. Creating and editing healthy edges lives in the row's own
 * panel (`useDependencyEdits`) — one flow, one place.
 */
export function useEdgeActions({ projectId }: UseEdgeActionsArgs) {
  const [createDependency, { isLoading: isCreating }] =
    useCreateDependencyMutation()
  const [removeDependency, { isLoading: isRemoving }] =
    useRemoveDependencyMutation()
  const { remove: handleRemoveEdge } = useDependencyEdits(projectId)

  /**
   * Re-link = point the successor at a live row, then drop the dead edge. The
   * order matters: create first, so a failed create leaves the broken edge (and
   * its visible cause) in place rather than silently dropping the link.
   */
  const handleRelink = async (
    edge: DependencyNode,
    predecessorId: string,
    dependencyType: DependencyType,
  ) => {
    await createDependency({
      taskId: edge.task.id,
      projectId,
      body: {
        depends_on_id: predecessorId,
        dependency_type: dependencyType,
        relationship_type: edge.relationshipType,
        lag_days: edge.lagDays,
      },
    }).unwrap()
    await removeDependency({
      taskId: edge.task.id,
      depId: Number(edge.id),
      projectId,
    }).unwrap()
  }

  return {
    isCreating,
    isRemoving,
    handleRemoveEdge,
    handleRelink,
  }
}
