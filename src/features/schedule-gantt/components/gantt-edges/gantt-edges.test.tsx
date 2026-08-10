import { renderWithProviders } from '@/tests/render-with-providers'
import type { DependencyNode, DependencyNodeTask } from '@/types'

import { BAR_HEIGHT, type BarGeometry } from '../../gantt-geometry'
import type { ScheduleRow } from '../../gantt-model'
import { EDGE_BROKEN } from '../../schedule-palette'

import { GanttEdges } from './gantt-edges'

const row = (id: string): ScheduleRow => ({
  id,
  parentId: null,
  level: 'task',
  title: id,
  status: 'in_progress',
  progress: 0,
  startDate: '2026-03-01',
  dueDate: '2026-03-10',
  delayReason: null,
  delayDays: 0,
  isBlocked: false,
  isCriticalPath: false,
  assigneeName: null,
  location: null,
  atRisk: false,
  forceStarted: false,
  isOverBudget: false,
  ref: null,
})

const nodeTask = (id: string): DependencyNodeTask => ({
  id,
  title: id,
  status: 'in_progress',
  priority: 'medium',
  progress: 0,
  startDate: '2026-03-01',
  dueDate: '2026-03-10',
  delayReason: null,
  delayDays: 0,
  isBlocked: false,
  forceStarted: false,
})

const edge = (overrides: Partial<DependencyNode> = {}): DependencyNode => ({
  id: '1',
  task: nodeTask('successor'),
  dependsOn: nodeTask('predecessor'),
  relationshipType: 'FS',
  lagDays: 0,
  isBroken: false,
  ...overrides,
})

/** Deterministic row→bar projection: rows sit at 30px pitch, bars 100px long. */
const geometries: Record<string, BarGeometry> = {
  predecessor: { x: 0, width: 100, delayWidth: 0, y: 0 },
  successor: { x: 120, width: 100, delayWidth: 0, y: 30 },
}
const barGeometry = (r: ScheduleRow) => geometries[r.id] ?? null

const rows = [row('predecessor'), row('successor')]

function renderEdges(edges: DependencyNode[], visibleRows: ScheduleRow[]) {
  // The component is one SVG layer of the chart — it needs an <svg> host.
  return renderWithProviders(
    <svg>
      <GanttEdges edges={edges} rows={visibleRows} barGeometry={barGeometry} />
    </svg>,
  )
}

describe('GanttEdges', () => {
  it('draws an FS edge from the predecessor bar end to the successor bar start', () => {
    const { container } = renderEdges([edge()], rows)

    const polylines = container.querySelectorAll('[data-testid="gantt-edge"]')
    expect(polylines).toHaveLength(1)
    // from = end of predecessor (100), to = start of successor (120), both
    // through the vertical bar centres (y + BAR_HEIGHT/2), elbowing at midX.
    const mid = BAR_HEIGHT / 2
    expect(polylines[0].getAttribute('points')).toBe(
      `100,${mid} 110,${mid} 110,${30 + mid} 120,${30 + mid}`,
    )
  })

  it('anchors an SS edge to the start of both bars', () => {
    const { container } = renderEdges([edge({ relationshipType: 'SS' })], rows)

    const points = container
      .querySelector('[data-testid="gantt-edge"]')
      ?.getAttribute('points')
    expect(points?.startsWith(`0,${BAR_HEIGHT / 2}`)).toBe(true)
    expect(points?.endsWith(`120,${30 + BAR_HEIGHT / 2}`)).toBe(true)
  })

  it('gives a broken edge a red stub instead of a line from nowhere', () => {
    const { container } = renderEdges(
      [edge({ dependsOn: null, isBroken: true })],
      rows,
    )

    expect(container.querySelector('[data-testid="gantt-edge"]')).toBeNull()
    const stub = container.querySelector('[data-testid="gantt-edge-broken"]')
    expect(stub).not.toBeNull()
    // The stub carries the broken-edge colour on both its line and marker —
    // the blocked row's visible cause.
    expect(stub?.querySelector('line')?.getAttribute('stroke')).toBe(
      EDGE_BROKEN,
    )
    expect(stub?.querySelector('circle')?.getAttribute('fill')).toBe(
      EDGE_BROKEN,
    )
  })

  it('draws nothing for an edge whose successor is filtered out of the view', () => {
    const { container } = renderEdges([edge()], [row('predecessor')])

    expect(container.querySelector('[data-testid="gantt-edge"]')).toBeNull()
    expect(
      container.querySelector('[data-testid="gantt-edge-broken"]'),
    ).toBeNull()
  })

  it('drops an intact edge whose predecessor is not among the visible rows', () => {
    const { container } = renderEdges([edge()], [row('successor')])

    expect(container.querySelector('[data-testid="gantt-edge"]')).toBeNull()
  })
})
