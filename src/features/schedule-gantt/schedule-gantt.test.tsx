import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { displayedDate } from '@/tests/intl-date'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { DependencyNode } from '@/types'

import {
  AXIS_HEIGHT,
  CHART_TAIL,
  LABEL_WIDTH,
  labelColumns,
  ROW_HEIGHT,
  ROW_OVERSCAN,
  SCROLL_AREA_MAX_H,
  SCROLLBAR_GUTTER,
  scrollAreaMaxHeight,
  STACKED_NAME_LINE,
} from './gantt-geometry'
import type { ScheduleRow } from './gantt-model'
import { ScheduleGantt, type ScheduleGanttProps } from './schedule-gantt'
import {
  BAR_SUBTASK,
  BAR_DELAY,
  BAR_TASK,
  BAR_SELECTED_STROKE,
  BLOCKED_STROKE,
  CRITICAL_HATCH_ID,
  EDGE_ARROW_ID,
  ROW_SELECTED,
} from './schedule-palette'

const row = (overrides: Partial<ScheduleRow> = {}): ScheduleRow => ({
  id: 'p1',
  parentId: null,
  level: 'task',
  title: 'Obras preliminares',
  status: 'todo',
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
  ...overrides,
})

const nodeTask = (id: string, title: string) => ({
  id,
  title,
  status: 'todo',
  priority: 'medium',
  progress: 0,
  startDate: null,
  dueDate: null,
  delayReason: null,
  delayDays: 0,
  isBlocked: false,
  forceStarted: false,
})

const edge = (overrides: Partial<DependencyNode> = {}): DependencyNode => ({
  id: '1',
  task: nodeTask('p2', 'Estructura'),
  dependsOn: nodeTask('p1', 'Obras preliminares'),
  relationshipType: 'FS',
  lagDays: 0,
  isBroken: false,
  ...overrides,
})

const twoRows = [
  row(),
  row({
    id: 'p2',
    title: 'Estructura',
    startDate: '2026-03-11',
    dueDate: '2026-03-20',
  }),
]

/**
 * The chart is controlled, so "selecting" is a round trip through the parent.
 * Comparing the two ways in means driving both through the same owner of the
 * state rather than passing `selectedRowId` by hand.
 */
function SelectableGantt(
  props: Omit<ScheduleGanttProps, 'selectedRowId' | 'onSelectRow'>,
) {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  return (
    <ScheduleGantt
      {...props}
      selectedRowId={selectedRowId}
      onSelectRow={setSelectedRowId}
    />
  )
}

/** What a selected bar's outline looks like, as a comparable value. */
const outlineShape = (element: Element) =>
  Object.fromEntries(
    ['x', 'y', 'width', 'height', 'rx', 'stroke', 'stroke-width', 'fill'].map(
      (name) => [name, element.getAttribute(name)],
    ),
  )

describe('ScheduleGantt', () => {
  it('says the timeline is empty instead of drawing an invented one', () => {
    renderWithProviders(
      <ScheduleGantt rows={[row({ startDate: null, dueDate: null })]} />,
    )

    expect(screen.getByText('No dated work yet')).toBeInTheDocument()
    expect(screen.queryByTestId('gantt-chart')).not.toBeInTheDocument()
  })

  it('draws a bar per dated row and none for an undated one', () => {
    renderWithProviders(
      <ScheduleGantt
        rows={[
          ...twoRows,
          row({ id: 'p3', title: 'Sin fecha', startDate: null, dueDate: null }),
        ]}
      />,
    )

    expect(screen.getAllByTestId('gantt-bar')).toHaveLength(2)
    expect(screen.getAllByTestId('gantt-row-label')).toHaveLength(3)
  })

  it('highlights the critical path and draws propagated delay past the baseline', () => {
    renderWithProviders(
      <ScheduleGantt
        rows={[
          row({ isCriticalPath: true, delayDays: 4 }),
          row({
            id: 'p2',
            title: 'Estructura',
            startDate: '2026-03-11',
            dueDate: '2026-03-20',
          }),
        ]}
        dayWidth={10}
      />,
    )

    expect(screen.getByTestId('gantt-bar-critical')).toBeInTheDocument()
    const delay = screen.getByTestId('gantt-bar-delay')
    // Four days of slip at ten pixels a day, drawn right after the baseline.
    expect(delay).toHaveAttribute('width', '40')
    expect(delay).toHaveAttribute('x', '100')
  })

  it('scales the chart to the calendar span, not to the row count', () => {
    renderWithProviders(<ScheduleGantt rows={twoRows} dayWidth={10} />)

    // 2026-03-01 → 2026-03-20 inclusive = 20 days, plus the tail the last
    // bar's handle and outline are drawn into.
    expect(screen.getByTestId('gantt-chart')).toHaveAttribute(
      'width',
      `${200 + CHART_TAIL}`,
    )
  })

  it('draws an edge between linked bars, pointed at the successor', () => {
    renderWithProviders(<ScheduleGantt rows={twoRows} edges={[edge()]} />)

    const line = screen.getByTestId('gantt-edge')
    expect(line).toBeInTheDocument()
    expect(screen.queryByTestId('gantt-edge-broken')).not.toBeInTheDocument()
    // Which end is the predecessor is the whole content of an edge, and the
    // polyline does not carry it: SS anchors start-to-start and FF end-to-end,
    // so the shape between the two bars is symmetric.
    expect(line).toHaveAttribute('marker-end', `url(#${EDGE_ARROW_ID})`)
  })

  it('marks a broken edge at its successor rather than hiding it', () => {
    renderWithProviders(
      <ScheduleGantt
        rows={twoRows}
        edges={[edge({ dependsOn: null, isBroken: true })]}
      />,
    )

    expect(screen.getByTestId('gantt-edge-broken')).toBeInTheDocument()
    expect(screen.queryByTestId('gantt-edge')).not.toBeInTheDocument()
  })

  it('keeps the broken marker on the canvas on the row that starts first', () => {
    // The stub reaches back toward a predecessor that is gone. On the earliest
    // row the bar sits at x=0, so an unfolded marker lands at negative x and is
    // clipped away — exactly in the filtered views someone opens to find
    // blocked rows, since narrowing the rows moves the timeline's origin.
    renderWithProviders(
      <ScheduleGantt
        rows={twoRows}
        edges={[
          edge({
            task: nodeTask('p1', 'Obras preliminares'),
            dependsOn: null,
            isBroken: true,
          }),
        ]}
        dayWidth={10}
      />,
    )

    const dot = screen.getByTestId('gantt-edge-broken').querySelector('circle')
    const cx = Number(dot?.getAttribute('cx'))
    const r = Number(dot?.getAttribute('r'))
    expect(cx - r).toBeGreaterThanOrEqual(0)
  })

  it('offers no link gesture — the graph is edited in the row panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ScheduleGantt rows={twoRows} />)

    await user.hover(screen.getAllByTestId('gantt-bar-group')[0])
    expect(screen.queryByTestId('gantt-link-handle')).not.toBeInTheDocument()
    expect(screen.queryByTestId('gantt-link-hint')).not.toBeInTheDocument()

    const labels = screen.getAllByTestId('gantt-row-label')
    labels[0].focus()
    await user.keyboard('l')
    expect(screen.queryByTestId('gantt-linking-banner')).not.toBeInTheDocument()
  })

  it('selects a row on click', async () => {
    const user = userEvent.setup()
    const onSelectRow = vi.fn()
    renderWithProviders(
      <ScheduleGantt rows={twoRows} onSelectRow={onSelectRow} />,
    )

    await user.click(screen.getAllByTestId('gantt-row-label')[1])
    expect(onSelectRow).toHaveBeenCalledWith('p2')
  })

  it('names each row for a screen reader with its level, its dates and its slip', () => {
    renderWithProviders(
      <ScheduleGantt
        rows={[
          row({ delayDays: 3 }),
          row({
            id: 's1',
            parentId: 'p1',
            level: 'subtask',
            title: 'Excavación',
          }),
        ]}
      />,
    )

    // The level opens the sentence. Which of the two levels a row is decides
    // what it can be linked to and where it opens, and indent says none of
    // that to a screen reader.
    expect(
      screen.getByLabelText(
        `Main activity · Obras preliminares. ${displayedDate('2026-03-01')} to ${displayedDate('2026-03-10')}. +3 days`,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(
        `Subactivity · Excavación. ${displayedDate('2026-03-01')} to ${displayedDate('2026-03-10')}. On time`,
      ),
    ).toBeInTheDocument()
  })

  describe('the chart has its own palette', () => {
    it('never paints a healthy bar the product warning colour', () => {
      // A normal bar must never share the warning value used for blocked,
      // at-risk and late.
      renderWithProviders(<ScheduleGantt rows={twoRows} />)

      for (const bar of screen.getAllByTestId('gantt-bar')) {
        expect(bar.getAttribute('fill')).not.toBe(BAR_DELAY)
      }
    })

    it('separates a phase from an activity by colour, not only by indent', () => {
      renderWithProviders(
        <ScheduleGantt
          rows={[
            row(),
            row({
              id: 'a1',
              parentId: 'p1',
              level: 'subtask',
              title: 'Excavación',
              startDate: '2026-03-02',
              dueDate: '2026-03-08',
            }),
          ]}
        />,
      )

      const bars = screen.getAllByTestId('gantt-bar')
      const phase = bars.find((bar) => bar.dataset.level === 'task')
      const activity = bars.find((bar) => bar.dataset.level === 'subtask')

      expect(phase?.getAttribute('fill')).toBe(BAR_TASK)
      expect(activity?.getAttribute('fill')).toBe(BAR_SUBTASK)
    })

    it('marks the critical path with a hatch, not with hue alone', () => {
      renderWithProviders(
        <ScheduleGantt rows={[row({ isCriticalPath: true })]} />,
      )

      // The one distinction the chart cannot afford to lose has to survive for
      // a reader who cannot separate red from amber.
      expect(screen.getByTestId('gantt-bar-critical')).toHaveAttribute(
        'fill',
        `url(#${CRITICAL_HATCH_ID})`,
      )
      expect(
        document.querySelector(`#${CRITICAL_HATCH_ID}`),
      ).toBeInTheDocument()
    })

    it('draws propagated delay in amber, past the baseline', () => {
      renderWithProviders(<ScheduleGantt rows={[row({ delayDays: 4 })]} />)

      const delay = screen.getByTestId('gantt-bar-delay')
      expect(delay).toHaveAttribute('fill', BAR_DELAY)
      // Appended past the bar: position separates it from critical when the
      // hues converge.
      const bar = screen.getByTestId('gantt-bar')
      expect(Number(delay.getAttribute('x'))).toBeGreaterThan(
        Number(bar.getAttribute('x')),
      )
    })

    it('outlines a blocked bar instead of only washing it out', () => {
      renderWithProviders(<ScheduleGantt rows={[row({ isBlocked: true })]} />)

      const bar = screen.getByTestId('gantt-bar')
      expect(bar).toHaveAttribute('stroke', BLOCKED_STROKE)
      expect(bar).toHaveAttribute('stroke-dasharray')
    })
  })

  describe('the selected row is visible on the chart', () => {
    it('shades the selected row across the full chart width', () => {
      renderWithProviders(
        <ScheduleGantt rows={twoRows} selectedRowId="p2" dayWidth={10} />,
      )

      const band = screen.getByTestId('gantt-row-selected')
      // Second row, full width: selection is answerable from the bars, not
      // only from the label column.
      expect(band).toHaveAttribute('y', '30')
      expect(band).toHaveAttribute('width', `${200 + CHART_TAIL}`)
      expect(band).toHaveAttribute('fill', ROW_SELECTED)
    })

    it('shades a phase and a subactivity alike', () => {
      const rows = [
        row(),
        row({
          id: 'a1',
          parentId: 'p1',
          level: 'subtask',
          title: 'Excavación',
          startDate: '2026-03-02',
          dueDate: '2026-03-08',
        }),
      ]

      const { unmount } = renderWithProviders(
        <ScheduleGantt rows={rows} selectedRowId="p1" />,
      )
      expect(screen.getByTestId('gantt-row-selected')).toHaveAttribute('y', '0')
      unmount()

      renderWithProviders(<ScheduleGantt rows={rows} selectedRowId="a1" />)
      expect(screen.getByTestId('gantt-row-selected')).toHaveAttribute(
        'y',
        '30',
      )
    })

    it('draws no band when nothing is selected, or for a row it does not have', () => {
      const { unmount } = renderWithProviders(<ScheduleGantt rows={twoRows} />)
      expect(screen.queryByTestId('gantt-row-selected')).toBeNull()
      unmount()

      renderWithProviders(
        <ScheduleGantt rows={twoRows} selectedRowId="from-another-project" />,
      )
      expect(screen.queryByTestId('gantt-row-selected')).toBeNull()
    })
  })

  describe('the bar and the label are one row', () => {
    it('selects the row when the bar itself is clicked', async () => {
      const onSelectRow = vi.fn()
      renderWithProviders(
        <ScheduleGantt rows={twoRows} onSelectRow={onSelectRow} />,
      )

      // The bar is the biggest target on screen — it must select.
      fireEvent.pointerUp(screen.getAllByTestId('gantt-bar')[1])
      expect(onSelectRow).toHaveBeenCalledWith('p2')
    })

    it('lights the row band when the pointer is on the bar', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ScheduleGantt rows={twoRows} dayWidth={10} />)

      expect(screen.queryByTestId('gantt-row-hovered')).toBeNull()

      await user.hover(screen.getAllByTestId('gantt-bar-group')[1])
      const band = await screen.findByTestId('gantt-row-hovered')
      expect(band).toHaveAttribute('y', '30')
      expect(band).toHaveAttribute('width', `${200 + CHART_TAIL}`)

      await user.unhover(screen.getAllByTestId('gantt-bar-group')[1])
      expect(screen.queryByTestId('gantt-row-hovered')).toBeNull()
    })

    it('lights the same band from the label, which lives in another subtree', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ScheduleGantt rows={twoRows} />)

      await user.hover(screen.getAllByTestId('gantt-row-label')[1])
      expect(await screen.findByTestId('gantt-row-hovered')).toHaveAttribute(
        'y',
        '30',
      )
    })

    it('keeps a selected row selected while the pointer is on its bar', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <ScheduleGantt rows={twoRows} selectedRowId="p2" dayWidth={10} />,
      )

      await user.hover(screen.getAllByTestId('gantt-bar-group')[1])

      // The band stays the selected one — hovering must not demote it.
      expect(screen.getByTestId('gantt-row-selected')).toHaveAttribute(
        'y',
        '30',
      )
      expect(screen.queryByTestId('gantt-row-hovered')).toBeNull()
    })
  })

  describe('selecting from either half outlines the same bar', () => {
    it('outlines the bar of a row selected from the label column', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectableGantt rows={twoRows} dayWidth={10} />)

      expect(screen.queryByTestId('gantt-bar-selected-outline')).toBeNull()

      await user.click(screen.getAllByTestId('gantt-row-label')[1])

      // This is the half that showed nothing at all: the label selected the
      // row and the bar never changed, because the only outline the bar had
      // was the focus ring a direct click happened to draw.
      const outline = screen.getByTestId('gantt-bar-selected-outline')
      const bar = screen.getAllByTestId('gantt-bar')[1]
      expect(outline).toHaveAttribute('stroke', BAR_SELECTED_STROKE)
      expect(Number(outline.getAttribute('x'))).toBe(
        Number(bar.getAttribute('x')) - 2,
      )
      expect(Number(outline.getAttribute('y'))).toBe(
        Number(bar.getAttribute('y')) - 2,
      )
      expect(Number(outline.getAttribute('width'))).toBe(
        Number(bar.getAttribute('width')) + 4,
      )
      // It must not eat the click that selects the row it marks.
      expect(outline).toHaveAttribute('pointer-events', 'none')
    })

    it('outlines the same bar when the bar itself is clicked', () => {
      renderWithProviders(<SelectableGantt rows={twoRows} dayWidth={10} />)

      fireEvent.pointerUp(screen.getAllByTestId('gantt-bar')[1])

      const outline = screen.getByTestId('gantt-bar-selected-outline')
      const bar = screen.getAllByTestId('gantt-bar')[1]
      expect(outline).toHaveAttribute('stroke', BAR_SELECTED_STROKE)
      expect(Number(outline.getAttribute('y'))).toBe(
        Number(bar.getAttribute('y')) - 2,
      )
    })

    it('leaves the two paths in the same visual state', async () => {
      const user = userEvent.setup()

      const viaLabel = renderWithProviders(
        <SelectableGantt rows={twoRows} dayWidth={10} />,
      )
      await user.click(screen.getAllByTestId('gantt-row-label')[1])
      const fromLabel = outlineShape(
        screen.getByTestId('gantt-bar-selected-outline'),
      )
      const bandFromLabel = screen
        .getByTestId('gantt-row-selected')
        .getAttribute('y')
      viaLabel.unmount()

      renderWithProviders(<SelectableGantt rows={twoRows} dayWidth={10} />)
      fireEvent.pointerUp(screen.getAllByTestId('gantt-bar')[1])
      const fromBar = outlineShape(
        screen.getByTestId('gantt-bar-selected-outline'),
      )

      // One row, one selected state — whichever half you clicked.
      expect(fromBar).toEqual(fromLabel)
      expect(screen.getByTestId('gantt-row-selected')).toHaveAttribute(
        'y',
        bandFromLabel,
      )
    })

    it('outlines a bar without taking away its blocked marks', () => {
      renderWithProviders(
        <ScheduleGantt
          rows={[row({ isBlocked: true })]}
          selectedRowId="p1"
          dayWidth={10}
        />,
      )

      // Selection is drawn as its own shape outside the bar, so it does not
      // overwrite the dashed stroke that says "cannot start".
      const bar = screen.getByTestId('gantt-bar')
      expect(bar).toHaveAttribute('stroke', BLOCKED_STROKE)
      expect(bar).toHaveAttribute('stroke-dasharray')
      expect(screen.getByTestId('gantt-bar-selected-outline')).toHaveAttribute(
        'stroke',
        BAR_SELECTED_STROKE,
      )
    })

    it('draws no outline for an unselected row, or for one it does not have', () => {
      const { unmount } = renderWithProviders(
        <ScheduleGantt rows={twoRows} selectedRowId="p2" />,
      )
      expect(screen.getAllByTestId('gantt-bar-selected-outline')).toHaveLength(
        1,
      )
      unmount()

      renderWithProviders(
        <ScheduleGantt rows={twoRows} selectedRowId="from-another-project" />,
      )
      expect(screen.queryByTestId('gantt-bar-selected-outline')).toBeNull()
    })

    it('keeps the bar group out of the tab order, so its ring is not the affordance', () => {
      renderWithProviders(<ScheduleGantt rows={twoRows} selectedRowId="p1" />)

      // Why the ring could never have been the selection mark: nothing reaches
      // the group by keyboard. The row label is the tab stop.
      for (const group of screen.getAllByTestId('gantt-bar-group')) {
        expect(group).toHaveAttribute('tabindex', '-1')
      }
      expect(screen.getAllByTestId('gantt-row-label')[0].tabIndex).toBe(0)
    })

    it('scopes the bar group ring to the keyboard instead of removing it', () => {
      renderWithProviders(<ScheduleGantt rows={twoRows} />)

      // The ring is not suppressed, it is scoped. A
      // pointer press draws none; keyboard focus still draws a deliberate one
      // in the product's own `ring` token, not the user agent's.
      const group = screen.getAllByTestId('gantt-bar-group')[0]
      const styled = Array.from(group.classList).find((name) =>
        name.startsWith('css-'),
      )
      expect(styled).toBeDefined()

      const css = Array.from(document.querySelectorAll('style'))
        .map((sheet) => sheet.textContent ?? '')
        .join('')
      expect(css).toContain(`.${styled}{outline:none;}`)
      expect(css).toMatch(
        new RegExp(
          `\\.${styled}:is\\(:focus-visible[^)]*\\)\\{outline:2px solid;outline-color:var\\(--lennix-colors-ring\\)`,
        ),
      )
    })
  })

  describe('the scroll area has room for what is not a row', () => {
    /**
     * The bug: `max-height: 70vh` was the budget for *everything*, so the
     * sticky axis ate 22px of it and the grid ended exactly at the scrollport
     * edge — where the horizontal scrollbar is drawn. The last row came back
     * cut. Both strips are now added on top of the rows' viewport.
     */
    it('adds the sticky axis and the scrollbar gutter to the rows’ viewport', () => {
      renderWithProviders(<ScheduleGantt rows={twoRows} />)

      // The base value is what jsdom resolves the responsive object to.
      expect(screen.getByTestId('gantt-scroll-area')).toHaveStyle({
        maxHeight: SCROLL_AREA_MAX_H.base,
      })
      expect(scrollAreaMaxHeight()).toContain(`${AXIS_HEIGHT + 16}px`)
    })

    it('ends the grid short of the scrollport, so the last row clears the scrollbar', () => {
      renderWithProviders(<ScheduleGantt rows={twoRows} />)

      expect(screen.getByTestId('gantt-grid')).toHaveStyle({
        paddingBottom: `${SCROLLBAR_GUTTER}px`,
      })
      // The gutter has to be a real strip, not a rounding accident.
      expect(SCROLLBAR_GUTTER).toBeGreaterThan(0)
    })

    it('gives the label column the width of the screen it is read on', () => {
      renderWithProviders(<ScheduleGantt rows={twoRows} dayWidth={10} />)

      // The chart column is the calendar's, unchanged; only the label column
      // responds — so a long task name is not paid for out of the timeline.
      expect(labelColumns(200)).toMatchObject({
        base: `${LABEL_WIDTH.base}px 200px`,
        xl: `${LABEL_WIDTH.xl}px 200px`,
      })
    })
  })

  describe('the axis holds at every width', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('sizes its text in style, which the CSS reset cannot override', () => {
      // Chakra's reset sets `* { font-size: inherit }`, and CSS outranks an SVG
      // `font-size` attribute: as an attribute, every label drew at 16px.
      renderWithProviders(<ScheduleGantt rows={twoRows} />)

      const label = screen.getByTestId('gantt-axis').querySelector('text')
      expect(label).toHaveStyle({ fontSize: '10px' })
    })

    it('keeps the last month label inside the chart when the span ends on the 1st', () => {
      renderWithProviders(
        <ScheduleGantt
          rows={[row({ startDate: '2025-06-01', dueDate: '2026-08-01' })]}
          dayWidth={8}
        />,
      )

      const axis = screen.getByTestId('gantt-axis')
      const last = [...axis.querySelectorAll('text')]
        .filter((text) => text.getAttribute('y') === '15')
        .at(-1)!
      // 45px: the width the model budgets for a `MMM yyyy` label.
      expect(Number(axis.getAttribute('width'))).toBeGreaterThanOrEqual(
        Number(last.getAttribute('x')) + 45,
      )
    })

    it('names every row above its bar on a phone, with nothing to unfold', () => {
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches: query === '(max-width: 47.99em)',
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }))
      renderWithProviders(<ScheduleGantt rows={twoRows} />)

      expect(screen.getByTestId('gantt-labels')).toHaveAttribute(
        'data-stacked',
        'true',
      )
      // Both names read; there is no fold control left to hide them behind.
      expect(screen.getByText('Obras preliminares')).toBeVisible()
      expect(screen.getByText('Estructura')).toBeVisible()
      expect(
        screen.queryByTestId('gantt-labels-toggle'),
      ).not.toBeInTheDocument()
      // The first bar sits below its name line, not centred over it.
      const firstBar = screen.getAllByTestId('gantt-bar')[0]
      expect(Number(firstBar.getAttribute('y'))).toBe(STACKED_NAME_LINE + 2)
    })
  })

  describe('the grid is a plane', () => {
    it('draws a line under every row, across the whole chart', () => {
      renderWithProviders(<ScheduleGantt rows={twoRows} dayWidth={10} />)

      const lines = screen.getAllByTestId('gantt-row-line')
      expect(lines).toHaveLength(twoRows.length)
      // Under the second row, full width: Y reads straight across to X.
      expect(lines[1]).toHaveAttribute('y1', String(2 * ROW_HEIGHT - 0.5))
      expect(lines[1]).toHaveAttribute(
        'x2',
        screen.getByTestId('gantt-chart').getAttribute('width'),
      )
    })
  })

  describe('the chart explains itself', () => {
    it('says what a row is on hover, in the same words the row label uses', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <ScheduleGantt rows={[row({ delayDays: 3, isCriticalPath: true })]} />,
      )

      // The accessible name is the contract: the tooltip must not be a second,
      // quieter description that says something else.
      const label = screen.getByTestId('gantt-row-label')
      const accessibleName = label.getAttribute('aria-label') ?? ''
      expect(accessibleName).toContain('Obras preliminares')
      expect(accessibleName).toContain('+3 days')
      expect(accessibleName).toContain('Critical')

      await user.hover(screen.getByTestId('gantt-bar-group'))
      const tip = await screen.findByTestId('tooltip')
      expect(tip).toHaveTextContent('Obras preliminares')
      expect(tip).toHaveTextContent('+3 days')
    })

    it('explains every dependency type where the edges are drawn', () => {
      renderWithProviders(<ScheduleGantt rows={twoRows} />)

      expect(screen.getByTestId('gantt-dependency-legend')).toBeInTheDocument()
      for (const type of ['FS', 'SS', 'FF', 'SF']) {
        expect(
          screen.getByTestId(`dependency-legend-${type}`),
        ).toBeInTheDocument()
      }
      // Not just the acronym — the plain-language rule sits next to it.
      expect(screen.getByTestId('dependency-legend-SS')).toHaveTextContent(
        'starts when the other starts',
      )
    })

    it('spells out an acronym on hover', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ScheduleGantt rows={twoRows} />)

      await user.hover(screen.getByTestId('dependency-legend-SF'))
      expect(await screen.findByTestId('tooltip')).toHaveTextContent(
        'Start → Finish',
      )
    })
  })

  describe('large schedules', () => {
    const many = (n: number) =>
      Array.from({ length: n }, (_, i) =>
        row({
          id: `r${i}`,
          title: `Row ${i}`,
          startDate: '2026-03-01',
          dueDate: '2026-03-10',
        }),
      )

    it('mounts only the scrollport of a 1,000-row schedule, and follows the scroll', () => {
      const rows = many(1000)
      renderWithProviders(<ScheduleGantt rows={rows} onSelectRow={vi.fn()} />)

      // A viewport of rows plus overscan, never the whole schedule.
      const mounted = screen.getAllByTestId('gantt-row-label').length
      expect(mounted).toBeLessThan(200)
      expect(mounted).toBeGreaterThan(ROW_OVERSCAN)
      expect(screen.getByText('Row 0')).toBeInTheDocument()
      expect(screen.queryByText('Row 900')).not.toBeInTheDocument()
      // The scroll height is still the whole schedule's — the thumb is honest.
      expect(screen.getByTestId('gantt-chart')).toHaveAttribute(
        'height',
        String(1000 * ROW_HEIGHT),
      )

      const area = screen.getByTestId('gantt-scroll-area')
      area.scrollTop = 900 * ROW_HEIGHT
      fireEvent.scroll(area)

      expect(screen.getByText('Row 900')).toBeInTheDocument()
      expect(screen.queryByText('Row 0')).not.toBeInTheDocument()
    })

    it('draws only the dependency edges that reach the mounted rows', () => {
      const rows = many(1000)
      // One finish-to-start chain through every row: 999 edges.
      const chain = rows.slice(1).map((successor, index) =>
        edge({
          id: `e${index}`,
          task: nodeTask(successor.id, successor.title),
          dependsOn: nodeTask(rows[index].id, rows[index].title),
        }),
      )
      renderWithProviders(
        <ScheduleGantt rows={rows} edges={chain} onSelectRow={vi.fn()} />,
      )

      // Edge i links row i to row i + 1. At the top, the window starts at row
      // 0, so the edges drawn are exactly those leaving a mounted row.
      const mounted = screen.getAllByTestId('gantt-row-label').length
      expect(mounted).toBeLessThan(200)
      expect(screen.getAllByTestId('gantt-edge')).toHaveLength(mounted)

      const area = screen.getByTestId('gantt-scroll-area')
      area.scrollTop = 900 * ROW_HEIGHT
      fireEvent.scroll(area)

      // Mid-chain, one more reaches the window: the edge entering its first
      // row from the row above it.
      expect(screen.getAllByTestId('gantt-edge')).toHaveLength(
        screen.getAllByTestId('gantt-row-label').length + 1,
      )
      const firstEdgeY = Number(
        screen
          .getAllByTestId('gantt-edge')[0]
          .getAttribute('points')
          ?.split(' ')[0]
          .split(',')[1],
      )
      expect(firstEdgeY).toBeGreaterThan(800 * ROW_HEIGHT)
    })

    it('keeps selection on the row it names once windowed', () => {
      const rows = many(1000)
      renderWithProviders(
        <ScheduleGantt rows={rows} selectedRowId="r5" onSelectRow={vi.fn()} />,
      )
      // The band sits on row 5's line, not on its position inside the window.
      expect(screen.getByTestId('gantt-row-selected')).toHaveAttribute(
        'y',
        String(5 * ROW_HEIGHT),
      )
    })
  })
})
