import type { DependencyNode, DependencyNodeTask } from '@/types'

/**
 * Which predecessors are still holding a subactivity — never whether it is
 * blocked (`subtask.isBlocked` is the backend's answer). Mirrors
 * `_dependency_satisfied` on the backend:
 *   - FS / FF need the predecessor finished (`done`);
 *   - SS / SF need it started (`in_progress` or `done`).
 * Callers must handle an empty result for a genuinely blocked subactivity.
 */
export function unsatisfiedPredecessors(
  nodes: DependencyNode[],
  subtaskId: string,
): DependencyNodeTask[] {
  return nodes
    .filter((node) => node.task.id === subtaskId)
    .filter((node) => !node.isBroken && node.dependsOn !== null)
    .filter((node) => !isSatisfied(node))
    .map((node) => node.dependsOn as DependencyNodeTask)
}

/**
 * Whether any edge into this row is broken — the backend's `is_broken`, read
 * rather than guessed. "Blocked with no predecessor to name" is not the same
 * fact: a chain that has not loaded, or a slice that does not carry the edge,
 * looks identical to a dead link and must not be reported as one.
 */
export function hasBrokenEdge(
  nodes: DependencyNode[],
  taskId: string,
): boolean {
  return nodes.some((node) => node.task.id === taskId && node.isBroken)
}

function isSatisfied(node: DependencyNode): boolean {
  const status = node.dependsOn?.status
  if (!status) return false
  if (node.relationshipType === 'FS' || node.relationshipType === 'FF') {
    return status === 'done'
  }
  return status === 'in_progress' || status === 'done'
}
