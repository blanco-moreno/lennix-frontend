/**
 * The real preview: the same chart the live project draws, fed from the review
 * state so the dependency arrows are actually there.
 *
 * `/import/{id}/preview` was the obvious source and is the wrong one — it
 * carries dates without edges, and a Gantt without arrows is a bar list. Read
 * only: no `onSelectRow`. Editing the graph is the schedule step.
 */

import { Flex, Stack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Heading, Text } from '@/components'
import { useFormatDate } from '@/i18n'
import type { ReviewDependency, ReviewTask } from '@/types'

import {
  buildTimeline,
  collapseRows,
  GanttZoom,
  ZOOM_DAY_WIDTH,
  type ZoomLevel,
} from '../../../schedule-gantt'
import { ScheduleGantt } from '../../../schedule-gantt/schedule-gantt'

import {
  buildReviewGanttEdges,
  buildReviewScheduleRows,
} from './review-gantt-rows'
import { schedulePreviewMessages as m } from './schedule-preview-messages'

export interface SchedulePreviewProps {
  tasks: ReviewTask[]
  dependencies: ReviewDependency[]
}

export function SchedulePreview({ tasks, dependencies }: SchedulePreviewProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const rows = useMemo(() => buildReviewScheduleRows(tasks), [tasks])
  const edges = useMemo(
    () => buildReviewGanttEdges(dependencies, rows),
    [dependencies, rows],
  )

  // First phase open, the rest folded: the first paint is N readable phase
  // bars, not a wall of every imported row — each phase is one tap away.
  // `null` until the user touches it, so a re-derive of `rows` cannot undo
  // an explicit choice.
  const [collapsedByUser, setCollapsedByUser] =
    useState<ReadonlySet<string> | null>(null)
  const collapsedIds = useMemo(
    () =>
      collapsedByUser ??
      new Set(
        rows
          .filter((row) => row.level === 'task')
          .slice(1)
          .map((row) => row.id),
      ),
    [collapsedByUser, rows],
  )
  const toggleCollapse = (rowId: string) => {
    const next = new Set(collapsedIds)
    if (next.has(rowId)) next.delete(rowId)
    else next.add(rowId)
    setCollapsedByUser(next)
  }

  const visibleRows = useMemo(
    () => collapseRows(rows, collapsedIds),
    [rows, collapsedIds],
  )

  const timeline = buildTimeline(rows)
  const phaseCount = rows.filter((row) => row.level === 'task').length
  // `fit` first: the preview's opening question is "did the whole schedule
  // land". The fixed steps are for reading a corner of it more closely.
  const [zoom, setZoom] = useState<ZoomLevel>('fit')

  return (
    <Stack gap="tight" data-testid="schedule-preview">
      <Flex align="flex-start" justify="space-between" gap="tight" wrap="wrap">
        <Stack gap={1}>
          <Heading size="h4" color="primary">
            {intl.formatMessage(m.title)}
          </Heading>
          <Text size="sm" color="muted">
            {intl.formatMessage(m.explainer)}
          </Text>
        </Stack>
        <GanttZoom value={zoom} onChange={setZoom} />
      </Flex>
      <Stack gap={1}>
        {/* The import's vitals in one line — did every row land, and does
            the span end where the planner believes it does. */}
        {timeline && (
          <Text size="xs" color="muted" data-testid="schedule-preview-summary">
            {intl.formatMessage(m.summary, {
              phases: phaseCount,
              activities: rows.length - phaseCount,
              start: formatDate(timeline.start),
              end: formatDate(timeline.end),
              days: timeline.days,
            })}
          </Text>
        )}
        <Text size="xs" color="muted" data-testid="schedule-preview-edges">
          {intl.formatMessage(m.edgeCount, { count: edges.length })}
        </Text>
      </Stack>

      {/* `scope="draft"`: the legend drops critical path, delay and the row
          marks, because none of them exist before the engine runs. */}
      <ScheduleGantt
        rows={visibleRows}
        edges={edges}
        dayWidth={ZOOM_DAY_WIDTH[zoom]}
        scope="draft"
        collapsedIds={collapsedIds}
        onToggleCollapse={toggleCollapse}
      />
    </Stack>
  )
}
