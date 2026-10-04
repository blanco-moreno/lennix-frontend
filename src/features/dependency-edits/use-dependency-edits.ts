/**
 * The graph's writes: create a link, change an edge's type or lag, remove it.
 * They live with the editor rather than with the schedule because every
 * surface that shows edges — the activity panel and the schedule's
 * broken-link list — needs the same evaluate-then-toast contract.
 *
 * Type and lag are `PATCH`ed, never delete-and-recreate: the edge keeps its
 * identity and the backend re-derives the schedule from it.
 */

import { useIntlToast } from '@/i18n'
import { apiErrorCode } from '@/services'
import {
  useCreateDependencyMutation,
  useRemoveDependencyMutation,
  useUpdateDependencyMutation,
} from '@/services/task'
import type { DependencyNode, RelationshipType } from '@/types'
import {
  evaluateLink,
  type DependencyType,
  type ExistingEdge,
  type LinkableRow,
} from '@/utils'

import { dependencyEditorMessages as m } from './dependency-editor-messages'

export interface CreateLinkArgs {
  predecessorId: string
  successorId: string
  /** The WBS the rule reads — phase or whose activity each row is. */
  rows: Map<string, LinkableRow>
  /** What already exists, so a duplicate is refused before the server. */
  existingEdges: ExistingEdge[]
  /**
   * The PDM shape, set in the same act that draws the edge. Creating first and
   * re-shaping after was two steps for one decision — the endpoint has always
   * taken both.
   */
  relationshipType?: RelationshipType
  lagDays?: number
}

/**
 * A refusal the server reached before we did — the graph moved under the
 * picker between the read and the click. The code names it; without one the
 * only honest thing left to say is "it failed".
 */
const CONFLICT_MESSAGE: Record<string, (typeof m)[keyof typeof m]> = {
  dependency_cycle: m.rejectedCycleServer,
  dependency_duplicate: m.rejectedDuplicate,
}

export function useDependencyEdits(projectId: string) {
  const notify = useIntlToast()
  const [updateDependency] = useUpdateDependencyMutation()
  const [createDependency, { isLoading: isCreating }] =
    useCreateDependencyMutation()
  const [removeDependency, { isLoading: isRemoving }] =
    useRemoveDependencyMutation()

  const run = async (
    call: () => Promise<unknown>,
    success: (typeof m)[keyof typeof m],
    failure: (typeof m)[keyof typeof m],
  ) => {
    try {
      await call()
      notify.success(success)
    } catch {
      notify.error(failure)
    }
  }

  const changeRelationship = async (
    edge: DependencyNode,
    relationshipType: RelationshipType,
  ) =>
    run(
      async () =>
        updateDependency({
          taskId: edge.task.id,
          depId: Number(edge.id),
          projectId,
          body: { relationship_type: relationshipType },
        }).unwrap(),
      m.edgeUpdated,
      m.edgeUpdateFailed,
    )

  const changeLag = async (edge: DependencyNode, lagDays: number) =>
    run(
      async () =>
        updateDependency({
          taskId: edge.task.id,
          depId: Number(edge.id),
          projectId,
          body: { lag_days: lagDays },
        }).unwrap(),
      m.edgeUpdated,
      m.edgeUpdateFailed,
    )

  /**
   * The add half of the editor: evaluate the pair with the same rule the
   * backend enforces, refuse with the reason, or create. One entry point for
   * every surface that offers "this waits for that".
   */
  const createLink = async ({
    predecessorId,
    successorId,
    rows,
    existingEdges,
    relationshipType,
    lagDays,
  }: CreateLinkArgs) => {
    const verdict = evaluateLink(
      { predecessorId, successorId },
      rows,
      existingEdges,
    )
    if (!verdict.ok || !verdict.dependencyType) {
      notify.error(
        verdict.reason === 'self'
          ? m.rejectedSelf
          : verdict.reason === 'duplicate'
            ? m.rejectedDuplicate
            : verdict.reason === 'cycle'
              ? m.rejectedCycle
              : m.rejectedPairing,
      )
      return false
    }
    try {
      await createDependency({
        taskId: successorId,
        projectId,
        body: {
          depends_on_id: predecessorId,
          dependency_type: verdict.dependencyType as DependencyType,
          ...(relationshipType && { relationship_type: relationshipType }),
          ...(lagDays !== undefined && { lag_days: lagDays }),
        },
      }).unwrap()
      notify.success(m.edgeCreated)
      return true
    } catch (error) {
      const code = apiErrorCode(error)
      notify.error(
        (code ? CONFLICT_MESSAGE[code] : undefined) ?? m.edgeCreateFailed,
      )
      return false
    }
  }

  const remove = async (edge: DependencyNode) =>
    run(
      async () =>
        removeDependency({
          taskId: edge.task.id,
          depId: Number(edge.id),
          projectId,
        }).unwrap(),
      m.edgeRemoved,
      m.edgeRemoveFailed,
    )

  return {
    changeRelationship,
    changeLag,
    createLink,
    remove,
    isCreating,
    isRemoving,
  }
}
