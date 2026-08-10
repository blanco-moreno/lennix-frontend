import type { DependencyNode } from '@/types'

import { BAR_HEIGHT, edgeAnchors, type BarGeometry } from '../../gantt-geometry'
import type { ScheduleRow } from '../../gantt-model'
import { EDGE_ARROW_ID, EDGE_BROKEN } from '../../schedule-palette'

/** How far back the broken-edge stub reaches, and the dot that caps it. */
const STUB_LENGTH = 18
const STUB_DOT_R = 3

interface GanttEdgesProps {
  edges: DependencyNode[]
  rows: ScheduleRow[]
  /** The chart's row→bar projection — owned by the chart, borrowed here. */
  barGeometry: (row: ScheduleRow) => BarGeometry | null
  /** The bar scale in force, so an edge lands on the centre of a touch bar. */
  barHeight?: number
}

/** The dependency layer of the chart: one polyline per edge, and a stub +
 *  marker for a broken edge, which has no predecessor to draw from. */
export function GanttEdges({
  edges,
  rows,
  barGeometry,
  barHeight = BAR_HEIGHT,
}: GanttEdgesProps) {
  const rowById = new Map(rows.map((row) => [row.id, row]))
  return (
    <>
      {edges.map((edge) => {
        const successor = rowById.get(edge.task.id)
        const to = successor ? barGeometry(successor) : null
        if (!to) return null
        const anchors = edgeAnchors(edge.relationshipType)
        const toX = anchors.to === 'start' ? to.x : to.x + to.width
        const toY = to.y + barHeight / 2

        // A broken edge has no predecessor to draw from — it gets a stub
        // and a marker so the row's blocked state has a visible cause.
        if (edge.isBroken || !edge.dependsOn) {
          // The stub reaches back toward a predecessor that is gone. On the
          // row that starts the timeline there is no "back there" on screen,
          // and a marker at negative x is clipped away by the SVG — exactly in
          // the filtered views someone opens to find blocked rows.
          // So the dot folds forward to the edge of the canvas and the line,
          // which has no room left to run, is dropped rather than degenerate.
          const dotX = Math.max(STUB_DOT_R, toX - STUB_LENGTH - 2)
          const hasRoomForLine = toX - dotX > STUB_DOT_R * 2
          return (
            <g key={edge.id} data-testid="gantt-edge-broken">
              {hasRoomForLine && (
                <line
                  x1={dotX + STUB_DOT_R}
                  x2={toX}
                  y1={toY}
                  y2={toY}
                  stroke={EDGE_BROKEN}
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                />
              )}
              <circle cx={dotX} cy={toY} r={STUB_DOT_R} fill={EDGE_BROKEN} />
            </g>
          )
        }

        const predecessor = rowById.get(edge.dependsOn.id)
        const from = predecessor ? barGeometry(predecessor) : null
        if (!from) return null
        const fromX = anchors.from === 'start' ? from.x : from.x + from.width
        const fromY = from.y + barHeight / 2
        const midX = (fromX + toX) / 2
        // FS with no lag is the default reading and needs no words; anything
        // else — a lag, or another PDM type — is exactly what the eye cannot
        // recover from the line's shape, so the edge says it.
        const parts = [
          edge.relationshipType !== 'FS' ? edge.relationshipType : null,
          edge.lagDays !== 0
            ? `${edge.lagDays > 0 ? '+' : ''}${edge.lagDays}d`
            : null,
        ].filter(Boolean)
        return (
          <g key={edge.id}>
            <polyline
              data-testid="gantt-edge"
              points={`${fromX},${fromY} ${midX},${fromY} ${midX},${toY} ${toX},${toY}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.35}
              strokeWidth={1.5}
              // Which end is the predecessor is the entire content of an edge,
              // and the line does not carry it: SS anchors start-to-start and
              // FF end-to-end, so the shape is symmetric between the two bars.
              markerEnd={`url(#${EDGE_ARROW_ID})`}
            />
            {parts.length > 0 && (
              <text
                data-testid="gantt-edge-label"
                x={midX + 3}
                y={(fromY + toY) / 2}
                dominantBaseline="central"
                fontSize={8}
                fill="currentColor"
                opacity={0.6}
                pointerEvents="none"
              >
                {parts.join(' ')}
              </text>
            )}
          </g>
        )
      })}
    </>
  )
}
