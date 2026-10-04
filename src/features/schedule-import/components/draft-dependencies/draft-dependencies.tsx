/**
 * The draft's dependency graph, editable before go-live: every edge — parsed
 * from the file or drawn by hand, each badged with which — plus what the file
 * stated that never became an edge.
 *
 * Rows and edges come from the review state, never from the live task list: a
 * draft has no status the engine computed, so none is shown. A new link is
 * judged against that same graph before it is offered, so a cycle or a
 * duplicate is refused in the picker, not by a 409. Every write lands at once —
 * activation sends no edges; it confirms the graph as it stands (`IMP-10`).
 */

import { Stack } from '@chakra-ui/react'
import { useId, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Badge, Card, Combobox, Heading, Text } from '@/components'
import {
  DependencyEditor,
  dependencyEditorMessages,
  LinkComposer,
  useDependencyEdits,
  type CandidateRowMeta,
} from '@/features'
import type { DependencyNode, ScheduleReviewState } from '@/types'
import { linkCandidates } from '@/utils'

import { useTrustCopy } from '../../hooks/use-trust-copy'
import {
  buildReviewGanttEdges,
  buildReviewScheduleRows,
} from '../schedule-preview'

import { draftDependenciesMessages as m } from './draft-dependencies-messages'

const NO_PIVOT: CandidateRowMeta = {
  parentId: null,
  startDate: null,
  dueDate: null,
}

export interface DraftDependenciesProps {
  projectId: string
  state: ScheduleReviewState
}

export function DraftDependencies({
  projectId,
  state,
}: DraftDependenciesProps) {
  const intl = useIntl()
  const copy = useTrustCopy()
  const subjectId = useId()
  const { changeRelationship, changeLag, createLink, remove, isCreating } =
    useDependencyEdits(projectId)
  const [composerOpen, setComposerOpen] = useState(false)
  const [successorId, setSuccessorId] = useState('')

  const graph = useMemo(() => {
    const rows = buildReviewScheduleRows(state.tasks)
    const position = new Map(rows.map((row, index) => [row.id, index]))
    const titles = new Map(rows.map((row) => [row.id, row.title]))
    const at = (id: string | undefined) =>
      id === undefined ? -1 : (position.get(id) ?? -1)
    return {
      rows,
      // The file's reading order: by the row that waits, then by what it
      // waits for.
      edges: buildReviewGanttEdges(state.dependencies, rows).sort(
        (a, b) =>
          at(a.task.id) - at(b.task.id) ||
          at(a.dependsOn?.id) - at(b.dependsOn?.id),
      ),
      sources: new Map(
        state.dependencies.map((edge) => [String(edge.id), edge.source]),
      ),
      existing: state.dependencies.map((edge) => ({
        taskId: edge.taskId,
        dependsOnId: edge.dependsOnId,
      })),
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
      // Same-named activities live under different phases, so a subactivity is
      // named with its phase: picking the wrong twin draws the wrong edge.
      subjects: rows.map((row) => ({
        value: row.id,
        label: row.parentId
          ? `${titles.get(row.parentId)} › ${row.title}`
          : row.title,
      })),
    }
  }, [state.tasks, state.dependencies])

  const candidates = useMemo(
    () =>
      successorId
        ? linkCandidates({
            pivotId: successorId,
            direction: 'upstream',
            rows: graph.rows,
            existing: graph.existing,
          })
        : [],
    [successorId, graph],
  )

  // A legal pair exists when two phases do, or two activities under one.
  const hasPairs =
    state.tasks.length > 1 ||
    state.tasks.some((task) => task.subtasks.length > 1)

  const closeComposer = () => {
    setComposerOpen(false)
    setSuccessorId('')
  }

  const badge = (edge: DependencyNode) =>
    graph.sources.get(edge.id) === 'manual' ? (
      <Badge variant="complementary">
        {intl.formatMessage(m.sourceManual)}
      </Badge>
    ) : (
      <Badge variant="outline">{intl.formatMessage(m.sourceFile)}</Badge>
    )

  const { skippedEdges, skippedEdgesTotal } = state.report

  return (
    <Card data-testid="draft-dependencies">
      <Stack gap="section">
        <Stack gap={1}>
          <Heading size="h4" color="primary">
            {intl.formatMessage(m.title, { count: graph.edges.length })}
          </Heading>
          <Text size="sm" color="muted">
            {intl.formatMessage(m.subtitle)}
          </Text>
        </Stack>

        <DependencyEditor
          edges={graph.edges}
          direction="both"
          emptyText={intl.formatMessage(m.empty)}
          renderBadge={badge}
          onChangeRelationship={changeRelationship}
          onChangeLag={changeLag}
          onRemove={remove}
          onOpenComposer={() => setComposerOpen(true)}
          isComposerOpen={composerOpen}
          hasCandidates={hasPairs}
          composer={
            <LinkComposer
              direction="upstream"
              subject={
                <Stack gap={1}>
                  <Text as="label" size="xs" color="muted" htmlFor={subjectId}>
                    {intl.formatMessage(m.subjectLabel)}
                  </Text>
                  <Combobox
                    id={subjectId}
                    size="sm"
                    value={successorId}
                    options={graph.subjects}
                    onValueChange={setSuccessorId}
                    placeholder={intl.formatMessage(
                      dependencyEditorMessages.addPlaceholder,
                    )}
                    noOptionsMessage={intl.formatMessage(
                      dependencyEditorMessages.addNoMatch,
                    )}
                  />
                </Stack>
              }
              candidates={candidates}
              rows={graph.meta}
              pivot={graph.meta.get(successorId) ?? NO_PIVOT}
              isBusy={isCreating}
              onClose={closeComposer}
              onSubmit={async ({ otherId, relationshipType, lagDays }) =>
                createLink({
                  predecessorId: otherId,
                  successorId,
                  rows: graph.linkable,
                  existingEdges: graph.existing,
                  relationshipType,
                  lagDays,
                })
              }
            />
          }
        />

        {skippedEdgesTotal > 0 && (
          <Stack gap={2} data-testid="skipped-edges">
            <Text size="sm" weight="medium" color="primary">
              {intl.formatMessage(m.skippedTitle, { count: skippedEdgesTotal })}
            </Text>
            {skippedEdges.map((edge, index) => (
              // One cell can state the same relationship twice — that is a
              // `duplicate` skip — so the position is part of the key.
              <Text
                key={`${edge.sheet}:${edge.row}:${index}`}
                size="sm"
                color="muted"
              >
                {intl.formatMessage(m.skippedItem, {
                  text: edge.text,
                  sheet: edge.sheet,
                  row: edge.row,
                  reason: copy.skippedEdgeReason(edge.reason),
                })}
              </Text>
            ))}
            {skippedEdges.length < skippedEdgesTotal && (
              <Text size="xs" color="muted">
                {intl.formatMessage(m.skippedCapped, {
                  shown: skippedEdges.length,
                  total: skippedEdgesTotal,
                })}
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
