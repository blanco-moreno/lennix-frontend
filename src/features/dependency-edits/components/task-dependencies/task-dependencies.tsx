/**
 * The dependency chain, read around the row the URL asked for: what has to
 * finish first, this row, what waits on it — the pivot layout is the reading
 * order a site engineer already has in their head.
 *
 * ## Which dependencies this shows
 *
 * The graph exists at two levels: `interPhase` links main activities to each
 * other, `intraPhase[phaseId]` links subactivities under one phase. The rule:
 * **this lists the links of the row the URL asked for** (`?subtask=`). Click a
 * phase, read the phase's inter-phase links; click a subactivity, read that
 * subactivity's links inside its phase. Never one standing in for the other.
 *
 * Ids are unique across both levels, so one filter over the flattened graph
 * answers it — no branch on level, nothing to keep in sync.
 *
 * ## Two surfaces, one grammar
 *
 * `variant` is the only thing that differs. In the schedule's drawer the panel
 * is ~md wide and sits on top of the Gantt: the drawer's own title already
 * names the row, so the pivot card and the arrows between the tiers are repeat
 * and ornament, and both cost scroll that a narrow panel does not have. On the
 * activity tab the panel owns the full width: the pivot becomes a band, the two
 * directions sit side by side instead of stacking, and the mini chart puts the
 * chain on the calendar.
 */

import { Box, Flex, Stack } from '@chakra-ui/react'
import { Unlink } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Badge, Card, EmptyState, Text } from '@/components'
import { usePermission } from '@/hooks'
import {
  useGetDependencyChainsQuery,
  useListProjectTasksQuery,
} from '@/services/task'
import type { DependencyNodeTask } from '@/types'
import { linkCandidates } from '@/utils'

import { buildScheduleRows, type ScheduleRow } from '../../../schedule-gantt'
import { ScheduleGantt } from '../../../schedule-gantt/schedule-gantt'
import { useDependencyEdits } from '../../use-dependency-edits'
import { DependencyEditor } from '../dependency-editor'
import { LinkComposer, type CandidateRowMeta } from '../link-composer'

import { taskDependenciesMessages as m } from './task-dependencies-messages'

type Direction = 'upstream' | 'downstream'

interface TaskDependenciesProps {
  projectId: string
  /** The row the URL asked for — a phase id or a subactivity id. */
  taskId: string
  /** That row's own title, for the pivot card. */
  taskTitle: string
  /** The row's level — it names the pivot, since indent cannot survive here. */
  level?: 'task' | 'subtask'
  /** Which surface is reading the graph. See the note at the top of the file. */
  variant?: 'drawer' | 'page'
}

/**
 * A chain neighbour as a chart row. Only what the node actually carries is
 * claimed — no critical path, no budget verdict: those belong to the full
 * schedule read.
 */
function nodeToRow(
  node: DependencyNodeTask,
  level: 'task' | 'subtask',
): ScheduleRow {
  return {
    id: node.id,
    parentId: null,
    level,
    title: node.title,
    status: node.status,
    progress: node.progress,
    startDate: node.startDate,
    dueDate: node.dueDate,
    delayReason: node.delayReason,
    delayDays: node.delayDays,
    isBlocked: node.isBlocked,
    isCriticalPath: false,
    assigneeName: null,
    location: null,
    atRisk: false,
    forceStarted: node.forceStarted,
    isOverBudget: false,
    ref: null,
  }
}

export function TaskDependencies({
  projectId,
  taskId,
  taskTitle,
  level = 'task',
  variant = 'page',
}: TaskDependenciesProps) {
  const intl = useIntl()
  const canEdit = usePermission('project.dependencies.manage')
  const { data: chains, isLoading } = useGetDependencyChainsQuery(projectId)
  // The composer is the only consumer of the whole project's rows — a reader
  // who cannot change the graph never pays for the request.
  const { data: tasks = [] } = useListProjectTasksQuery(projectId, {
    skip: !canEdit,
  })
  const { changeRelationship, changeLag, createLink, remove, isCreating } =
    useDependencyEdits(projectId)
  const [openComposer, setOpenComposer] = useState<Direction | null>(null)

  const { predecessors, successors, brokenCount } = useMemo(() => {
    const all = chains
      ? [...chains.interPhase, ...Object.values(chains.intraPhase).flat()]
      : []
    // An edge points predecessor → successor. Where `taskId` sits on that
    // edge is what makes it a "waits for" or a "blocks".
    const mine = all.filter(
      (edge) => edge.task.id === taskId || edge.dependsOn?.id === taskId,
    )
    return {
      predecessors: mine.filter(
        (edge) => edge.task.id === taskId && !edge.isBroken,
      ),
      successors: mine.filter((edge) => edge.dependsOn?.id === taskId),
      brokenCount: mine.filter((edge) => edge.isBroken).length,
    }
  }, [chains, taskId])

  // The chain, on the calendar: predecessors above, this row banded, what it
  // blocks below — the same edges the lists edit, drawn as bars. The pivot is
  // painted at phase weight and its neighbours lighter, so the eye lands on
  // the row the page is about.
  const timelineRows = useMemo<ScheduleRow[]>(() => {
    const pivot = predecessors[0]?.task ?? successors[0]?.dependsOn
    if (!pivot) return []
    const seen = new Set<string>([pivot.id])
    const neighbours = (nodes: (DependencyNodeTask | null)[]) =>
      nodes.flatMap((node) => {
        if (!node || seen.has(node.id)) return []
        seen.add(node.id)
        return [nodeToRow(node, 'subtask')]
      })
    return [
      ...neighbours(predecessors.map((edge) => edge.dependsOn)),
      nodeToRow(pivot, 'task'),
      ...neighbours(successors.map((edge) => edge.task)),
    ]
  }, [predecessors, successors])

  /**
   * Every other row of the project, judged per direction by the one rule in
   * `linkCandidates` — legal ones first, refused ones kept with the reason so
   * the picker can say why instead of leaving a gap where a row should be.
   *
   * The cycle half of that verdict is computed from `chains`, which carries the
   * project's whole committed graph. It is the server's own walk over the
   * server's own edges, not a guess; the 409 remains for the race where someone
   * else links while this panel is open.
   */
  const { upstream, downstream, rowMap, rowMeta, existingEdges } =
    useMemo(() => {
      const rows = buildScheduleRows(tasks)
      const all = chains
        ? [...chains.interPhase, ...Object.values(chains.intraPhase).flat()]
        : []
      const existing = all
        .filter((edge) => edge.dependsOn)
        .map((edge) => ({
          taskId: edge.task.id,
          dependsOnId: edge.dependsOn!.id,
        }))
      return {
        rowMap: new Map(
          rows.map((row) => [row.id, { parentId: row.parentId }]),
        ),
        rowMeta: new Map<string, CandidateRowMeta>(
          rows.map((row) => [
            row.id,
            {
              parentId: row.parentId,
              startDate: row.startDate,
              dueDate: row.dueDate,
            },
          ]),
        ),
        existingEdges: existing,
        upstream: linkCandidates({
          pivotId: taskId,
          direction: 'upstream',
          rows,
          existing,
        }),
        downstream: linkCandidates({
          pivotId: taskId,
          direction: 'downstream',
          rows,
          existing,
        }),
      }
    }, [tasks, chains, taskId])

  const pivotMeta: CandidateRowMeta = rowMeta.get(taskId) ?? {
    parentId: level === 'subtask' ? taskId : null,
    startDate: null,
    dueDate: null,
  }

  const composerFor = (direction: Direction) => (
    <LinkComposer
      direction={direction}
      candidates={direction === 'upstream' ? upstream : downstream}
      rows={rowMeta}
      pivot={pivotMeta}
      isBusy={isCreating}
      onClose={() => setOpenComposer(null)}
      onSubmit={async ({ otherId, relationshipType, lagDays }) =>
        createLink({
          predecessorId: direction === 'upstream' ? otherId : taskId,
          successorId: direction === 'upstream' ? taskId : otherId,
          rows: rowMap,
          existingEdges,
          relationshipType,
          lagDays,
        })
      }
    />
  )

  const editorFor = (direction: Direction) => {
    const upstreamSide = direction === 'upstream'
    const candidates = upstreamSide ? upstream : downstream
    return (
      <DependencyEditor
        edges={upstreamSide ? predecessors : successors}
        direction={direction}
        readOnly={!canEdit}
        heading={intl.formatMessage(upstreamSide ? m.waitsFor : m.blocks, {
          count: (upstreamSide ? predecessors : successors).length,
        })}
        emptyText={intl.formatMessage(
          upstreamSide ? m.waitsForEmpty : m.blocksEmpty,
        )}
        onChangeRelationship={changeRelationship}
        onChangeLag={changeLag}
        onRemove={remove}
        composer={composerFor(direction)}
        onOpenComposer={canEdit ? () => setOpenComposer(direction) : undefined}
        isComposerOpen={openComposer === direction}
        hasCandidates={candidates.some((candidate) => candidate.verdict.ok)}
        isLoading={isLoading}
      />
    )
  }

  const pivotCard = (
    <Card size="compact" data-testid="dependency-pivot">
      <Flex align="center" gap={2} justify="center" wrap="wrap">
        <Badge variant={level === 'task' ? 'gray' : 'outline'}>
          {intl.formatMessage(
            level === 'task' ? m.pivotLevelTask : m.pivotLevelSubtask,
          )}
        </Badge>
        <Text size="sm" weight="medium" color="primary">
          {taskTitle}
        </Text>
      </Flex>
    </Card>
  )

  // Nothing either way is a state, not an accident — and a row with no links is
  // a row outside the critical path, which is the thing this product is for. It
  // gets said once, with the way out, rather than twice as an empty list.
  // Not while the chain is still being read: an unanswered query looks exactly
  // like a row with no links, and "this row is off the critical path" is a
  // claim about the schedule, not a placeholder.
  const isEmpty =
    !isLoading &&
    predecessors.length === 0 &&
    successors.length === 0 &&
    brokenCount === 0
  if (isEmpty && openComposer === null) {
    return (
      <Stack gap={3} data-testid="task-dependencies">
        {variant === 'page' && pivotCard}
        <EmptyState
          icon={Unlink}
          title={intl.formatMessage(m.emptyTitle)}
          description={intl.formatMessage(m.emptyDescription)}
          action={
            canEdit && upstream.some((candidate) => candidate.verdict.ok)
              ? {
                  label: intl.formatMessage(m.emptyAction),
                  onClick: () => setOpenComposer('upstream'),
                }
              : undefined
          }
        />
      </Stack>
    )
  }

  return (
    <Stack gap={3} data-testid="task-dependencies">
      {variant === 'page' ? (
        <>
          {pivotCard}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={4}
            align="flex-start"
          >
            <Box flex="1" minW={0} w="full">
              {editorFor('upstream')}
            </Box>
            <Box flex="1" minW={0} w="full">
              {editorFor('downstream')}
            </Box>
          </Flex>
        </>
      ) : (
        // No pivot card and no arrows: the drawer's own title names the row,
        // and the two headings already say which way each list runs. Both were
        // repeat, and repeat costs scroll a ~md panel does not have.
        <>
          {editorFor('upstream')}
          {editorFor('downstream')}
        </>
      )}

      {brokenCount > 0 && (
        <Text size="xs" color="error" data-testid="activity-broken-note">
          {intl.formatMessage(m.broken, { count: brokenCount })}
        </Text>
      )}

      {variant === 'page' && timelineRows.length > 1 && (
        <Stack gap="tight" data-testid="dependency-timeline">
          <Text size="sm" weight="medium" color="primary">
            {intl.formatMessage(m.timeline)}
          </Text>
          <ScheduleGantt
            rows={timelineRows}
            edges={[...predecessors, ...successors]}
            dayWidth="fit"
            selectedRowId={taskId}
          />
        </Stack>
      )}
    </Stack>
  )
}
