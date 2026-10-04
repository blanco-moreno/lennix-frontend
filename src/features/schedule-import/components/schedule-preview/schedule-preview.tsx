/**
 * The real preview: the same chart the live project draws, fed from the review
 * state so the dependency arrows are actually there.
 *
 * `/import/{id}/preview` was the obvious source and is the wrong one — it
 * carries dates without edges, and a Gantt without arrows is a bar list. Read
 * only: no `onSelectRow`. Editing the graph is the schedule step. The counts
 * and the span are the confirm summary's facts line, so the chart repeats
 * neither.
 */

import { Flex, Stack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

import type { ReviewDependency, ReviewTask } from '@/types'

import {
  collapseRows,
  GanttZoom,
  ZOOM_DAY_WIDTH,
  type ZoomLevel,
} from '../../../schedule-gantt'
import { ScheduleGantt } from '../../../schedule-gantt/schedule-gantt'
import { usePhaseFolding } from '../../hooks/use-phase-folding'

import {
  buildReviewGanttEdges,
  buildReviewScheduleRows,
} from './review-gantt-rows'

export interface SchedulePreviewProps {
  tasks: ReviewTask[]
  dependencies: ReviewDependency[]
}

export function SchedulePreview({ tasks, dependencies }: SchedulePreviewProps) {
  const rows = useMemo(() => buildReviewScheduleRows(tasks), [tasks])
  const edges = useMemo(
    () => buildReviewGanttEdges(dependencies, rows),
    [dependencies, rows],
  )

  const { collapsedIds, toggleCollapse } = usePhaseFolding(rows)

  const visibleRows = useMemo(
    () => collapseRows(rows, collapsedIds),
    [rows, collapsedIds],
  )

  // Week, like the live schedule: the preview scrolls through the span.
  const [zoom, setZoom] = useState<ZoomLevel>('week')

  return (
    <Stack gap="tight" data-testid="schedule-preview">
      <Flex justify="flex-end">
        <GanttZoom value={zoom} onChange={setZoom} />
      </Flex>

      {/* `scope="draft"`: the legend drops critical path, delay and the
          engine's marks, because none of them exist before the engine runs. */}
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
