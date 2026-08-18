import {
  ROW_OVERSCAN,
  rowWindow,
  WINDOW_MIN_ROWS,
  AXIS_HEIGHT,
  edgeAnchors,
  LABEL_WIDTH,
  labelColumns,
  SCROLLBAR_GUTTER,
  scrollAreaMaxHeight,
} from './gantt-geometry'

describe('scrollAreaMaxHeight', () => {
  it('adds the strips that are not rows on top of the rows viewport', () => {
    // The bug it fixes: with the axis and the scrollbar taken *out* of the
    // budget, the last row ended flush with the scrollport edge — under the
    // horizontal scrollbar.
    expect(scrollAreaMaxHeight('70vh')).toBe(
      `calc(70vh + ${AXIS_HEIGHT + SCROLLBAR_GUTTER}px)`,
    )
  })

  it('reserves both strips, not only one of them', () => {
    const reserved = Number(
      /\+ (\d+)px/.exec(scrollAreaMaxHeight('70vh'))?.[1] ?? 0,
    )
    expect(reserved).toBeGreaterThanOrEqual(AXIS_HEIGHT + SCROLLBAR_GUTTER)
  })
})

describe('labelColumns', () => {
  it('keeps the timeline fixed and lets only the label column respond', () => {
    const columns = labelColumns(600)

    expect(Object.keys(columns)).toEqual(Object.keys(LABEL_WIDTH))
    for (const [breakpoint, template] of Object.entries(columns)) {
      expect(template).toBe(
        `${LABEL_WIDTH[breakpoint as keyof typeof LABEL_WIDTH]}px 600px`,
      )
    }
  })

  it('gives a wider screen a wider column for the name', () => {
    expect(LABEL_WIDTH.xl).toBeGreaterThan(LABEL_WIDTH.md)
    expect(LABEL_WIDTH.md).toBeGreaterThan(LABEL_WIDTH.base)
  })
})

describe('rowWindow', () => {
  it('mounts every row of a schedule under the windowing threshold', () => {
    expect(rowWindow(WINDOW_MIN_ROWS, 28, 5000, 500)).toEqual({
      start: 0,
      end: WINDOW_MIN_ROWS,
    })
  })

  it('slices a large schedule to the viewport plus overscan on both sides', () => {
    // scrollTop 2800 at 28px/row → first visible row 100; a 560px viewport
    // shows 20 rows; overscan pads both ends.
    expect(rowWindow(5000, 28, 2800, 560)).toEqual({
      start: 100 - ROW_OVERSCAN,
      end: 120 + ROW_OVERSCAN,
    })
  })

  it('clamps to the schedule at both ends', () => {
    expect(rowWindow(5000, 28, 0, 560).start).toBe(0)
    expect(rowWindow(5000, 28, 1_000_000, 560).end).toBe(5000)
  })
})

describe('edgeAnchors', () => {
  it.each([
    ['FS', 'end', 'start'],
    ['SS', 'start', 'start'],
    ['FF', 'end', 'end'],
    ['SF', 'start', 'end'],
  ] as const)('%s anchors from %s to %s', (type, from, to) => {
    expect(edgeAnchors(type)).toEqual({ from, to })
  })

  it('anything unrecognized draws as FS', () => {
    expect(edgeAnchors('nonsense')).toEqual({ from: 'end', to: 'start' })
  })
})
