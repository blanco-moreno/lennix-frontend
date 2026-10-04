/**
 * The row's predecessors, editable before go-live: each badged with where it
 * came from, type and lag changed in place, a new one added with its shape in
 * the same act (`DEP-2`, `DEP-5`). Above them, any predecessor the file named
 * that matched no row — a question, never an edge (`IMP-3`).
 *
 * Rows and edges come from the review state, and a new link is judged against
 * that same graph before it is offered, so a cycle or a duplicate is refused in
 * the picker rather than by a 409 (`DEP-4`). Every write lands at once:
 * activation confirms the graph as it stands (`IMP-10`).
 */

import { Stack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Badge } from '@/components'
import {
  DependencyEditor,
  LinkComposer,
  useDependencyEdits,
  type CandidateRowMeta,
} from '@/features/dependency-edits'
import type { DependencyNode, ScheduleReviewState } from '@/types'
import { linkCandidates } from '@/utils'

import { PredecessorPickerCard } from '../../../review-tray/components/predecessor-picker-card'
import type { UnresolvedEdgeException } from '../../../review-tray/review-exceptions'
import {
  buildReviewGanttEdges,
  buildReviewScheduleRows,
} from '../../../schedule-preview'
import { rowDrawerMessages as m } from '../../row-drawer-messages'

export interface RowDependenciesProps {
  projectId: string
  state: ScheduleReviewState
  rowId: string
  /** The row's open predecessor questions. */
  questions: UnresolvedEdgeException[]
  readOnly: boolean
}

export function RowDependencies({
  projectId,
  state,
  rowId,
  questions,
  readOnly,
}: RowDependenciesProps) {
  const intl = useIntl()
  const { changeRelationship, changeLag, createLink, remove, isCreating } =
    useDependencyEdits(projectId)
  const [composerOpen, setComposerOpen] = useState(false)

  const graph = useMemo(() => {
    const rows = buildReviewScheduleRows(state.tasks)
    const existing = state.dependencies.map((edge) => ({
      taskId: edge.taskId,
      dependsOnId: edge.dependsOnId,
    }))
    return {
      edges: buildReviewGanttEdges(state.dependencies, rows).filter(
        (edge) => edge.task.id === rowId,
      ),
      sources: new Map(
        state.dependencies.map((edge) => [String(edge.id), edge.source]),
      ),
      existing,
      linkable: new Map(
        rows.map((row) => [row.id, { parentId: row.parentId }]),
      ),
      meta: new Map<string, CandidateRowMeta>(
        rows.map((row) => [
          row.id,
          {
            parentId: row.parentId,
            startDate: row.startDate,
            dueDate: row.dueDate,
          },
        ]),
      ),
      candidates: linkCandidates({
        pivotId: rowId,
        direction: 'upstream',
        rows,
        existing,
      }),
    }
  }, [state.tasks, state.dependencies, rowId])

  const badge = (edge: DependencyNode) =>
    graph.sources.get(edge.id) === 'manual' ? (
      <Badge variant="complementary">
        {intl.formatMessage(m.sourceManual)}
      </Badge>
    ) : (
      <Badge variant="outline">{intl.formatMessage(m.sourceFile)}</Badge>
    )

  return (
    <Stack gap="tight" data-testid="row-dependencies">
      {!readOnly &&
        questions.map((question) => (
          <PredecessorPickerCard
            key={question.id}
            projectId={projectId}
            exception={question}
            tasks={state.tasks}
            dependencies={state.dependencies}
          />
        ))}

      <DependencyEditor
        edges={graph.edges}
        direction="upstream"
        heading={intl.formatMessage(m.predecessors, {
          count: graph.edges.length,
        })}
        emptyText={intl.formatMessage(m.noPredecessors)}
        renderBadge={badge}
        readOnly={readOnly}
        onChangeRelationship={changeRelationship}
        onChangeLag={changeLag}
        onRemove={remove}
        onOpenComposer={readOnly ? undefined : () => setComposerOpen(true)}
        isComposerOpen={composerOpen}
        hasCandidates={graph.candidates.some(
          (candidate) => candidate.verdict.ok,
        )}
        composer={
          <LinkComposer
            direction="upstream"
            candidates={graph.candidates}
            rows={graph.meta}
            pivot={graph.meta.get(rowId) ?? NO_PIVOT}
            isBusy={isCreating}
            onClose={() => setComposerOpen(false)}
            onSubmit={async ({ otherId, relationshipType, lagDays }) =>
              createLink({
                predecessorId: otherId,
                successorId: rowId,
                rows: graph.linkable,
                existingEdges: graph.existing,
                relationshipType,
                lagDays,
              })
            }
          />
        }
      />
    </Stack>
  )
}

const NO_PIVOT: CandidateRowMeta = {
  parentId: null,
  startDate: null,
  dueDate: null,
}
