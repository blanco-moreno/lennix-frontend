import { renderWithProviders } from '@/tests/render-with-providers'
import type { DependencyNode, DependencyNodeTask } from '@/types'

import {
  BAR_HEIGHT,
  type BarGeometry,
  type RowRange,
} from '../../gantt-geometry'
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

  describe('inside a row window', () => {
    const ROW_PITCH = 30
    const stack = (count: number) =>
      Array.from({ length: count }, (_, index) => row(`r${index}`))
    /** Row `rN` sits on the Nth line: its bar's y is N rows down. */
    const stackedGeometry = (r: ScheduleRow): BarGeometry => {
      const index = Number(r.id.slice(1))
      return { x: index * 10, width: 8, delayWidth: 0, y: index * ROW_PITCH }
    }
    const link = (id: string, from: number, to: number): DependencyNode =>
      edge({ id, dependsOn: nodeTask(`r${from}`), task: nodeTask(`r${to}`) })

    function renderWindowed(
      edges: DependencyNode[],
      rowRange?: RowRange,
      rowCount = 100,
    ) {
      return renderWithProviders(
        <svg>
          <GanttEdges
            edges={edges}
            rows={stack(rowCount)}
            barGeometry={stackedGeometry}
            rowRange={rowRange}
          />
        </svg>,
      )
    }
    const drawn = (container: Element) =>
      [...container.querySelectorAll('[data-testid="gantt-edge"]')].map(
        (line) => line.getAttribute('points'),
      )

    const band = { start: 40, end: 60 }

    it('skips an edge whose rows both sit above the window', () => {
      const { container } = renderWindowed([link('a', 10, 20)], band)
      expect(drawn(container)).toHaveLength(0)
    })

    it('skips an edge whose rows both sit below the window', () => {
      const { container } = renderWindowed([link('b', 70, 90)], band)
      expect(drawn(container)).toHaveLength(0)
    })

    it('keeps an edge with one end inside the window', () => {
      const { container } = renderWindowed(
        [link('c', 10, 45), link('d', 55, 90)],
        band,
      )
      expect(drawn(container)).toHaveLength(2)
    })

    it('keeps an edge that crosses the window with both ends outside it', () => {
      const { container } = renderWindowed([link('e', 5, 95)], band)
      expect(drawn(container)).toHaveLength(1)
    })

    it('treats the window as half-open: its last row is end - 1', () => {
      const { container } = renderWindowed(
        [link('f', 59, 80), link('g', 60, 80), link('h', 10, 40)],
        band,
      )
      expect(drawn(container)).toHaveLength(2)
    })

    it('keeps a broken edge inside the window and skips one outside it', () => {
      const broken = (id: string, to: number) =>
        edge({ id, dependsOn: null, isBroken: true, task: nodeTask(`r${to}`) })
      const { container } = renderWindowed(
        [broken('in', 50), broken('out', 80)],
        band,
      )
      expect(
        container.querySelectorAll('[data-testid="gantt-edge-broken"]'),
      ).toHaveLength(1)
    })

    it('draws exactly the unwindowed edges that reach the window, point for point', () => {
      // A fixed linear congruential sequence: reproducible, no Math.random.
      let seed = 20261019
      const next = (limit: number) => {
        seed = (Math.imul(seed, 1103515245) + 12345) >>> 0
        return (seed >>> 8) % limit
      }
      const edges = Array.from({ length: 400 }, (_, index) =>
        link(`x${index}`, next(100), next(100)),
      )
      const all = renderWindowed(edges)
      const everything = [
        ...all.container.querySelectorAll('[data-testid="gantt-edge"]'),
      ]
      expect(everything).toHaveLength(400)

      for (const range of [
        { start: 0, end: 100 },
        { start: 0, end: 12 },
        { start: 40, end: 60 },
        { start: 88, end: 100 },
      ]) {
        const top = range.start * ROW_PITCH
        const bottom = range.end * ROW_PITCH
        // The reference: every edge today, kept when its drawn vertical
        // extent touches the window's band of pixels.
        const expected = everything
          .map((line) => line.getAttribute('points') ?? '')
          .filter((points) => {
            const ys = points
              .split(' ')
              .map((pair) => Number(pair.split(',')[1]))
            return Math.max(...ys) >= top && Math.min(...ys) < bottom
          })
        const { container, unmount } = renderWindowed(edges, range)
        expect(drawn(container)).toEqual(expected)
        unmount()
      }
    })
  })
})
