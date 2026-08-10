/** Shared layout scale of the chart — one home, so the label column, the axis
 *  and every SVG layer agree on where a row sits. */
export const ROW_HEIGHT = 30
export const BAR_HEIGHT = 14
export const AXIS_HEIGHT = 22
/**
 * The second axis row — dated weeks under the months. Only paid for when the
 * zoom is wide enough for weeks to carry a date; below that the axis is one
 * row again, because an empty strip is not a tier.
 */
export const SUBAXIS_HEIGHT = 16

/**
 * The same scale for a finger.
 *
 * A 30px row whose bar is 14px tall is a mouse target. The schedule is edited
 * on a tablet on site, sometimes with gloves, and 14px of bar is not something
 * a finger can be asked to hit — so on a coarse pointer the row grows to the
 * 44px touch floor and the bar with it. It costs about two rows of the visible
 * window, which is the honest price of the gesture working at all.
 */
export const TOUCH_ROW_HEIGHT = 44
export const TOUCH_BAR_HEIGHT = 20

/**
 * The invisible circle around the link dot that actually takes the press. The
 * visible dot stays small at both scales — it reads at bar scale and a finger
 * does not need to see its own target, only to hit it.
 */
export const HANDLE_HIT_RADIUS = 9
export const TOUCH_HANDLE_HIT_RADIUS = 22

export interface GanttMetrics {
  rowHeight: number
  barHeight: number
  handleHitRadius: number
  /** True where there is no hover to reveal anything with. */
  coarsePointer: boolean
}

export function ganttMetrics(coarsePointer: boolean): GanttMetrics {
  return coarsePointer
    ? {
        rowHeight: TOUCH_ROW_HEIGHT,
        barHeight: TOUCH_BAR_HEIGHT,
        handleHitRadius: TOUCH_HANDLE_HIT_RADIUS,
        coarsePointer: true,
      }
    : {
        rowHeight: ROW_HEIGHT,
        barHeight: BAR_HEIGHT,
        handleHitRadius: HANDLE_HIT_RADIUS,
        coarsePointer: false,
      }
}

/**
 * The label column, per breakpoint.
 *
 * It was a fixed 260px, which was half the truncation bug: the title shared
 * that width with three text badges and was measured down to 38px on a real
 * row. The name is the row's identifier — it gets the column, and the column
 * grows with the screen the schedule is read on.
 */
export const LABEL_WIDTH = { base: 160, md: 260, xl: 380 } as const

/**
 * The label column with the names folded away.
 *
 * At 160px the column eats 41% of a 390px phone, leaving 230px of timeline —
 * about four weeks at the default zoom. Collapsed it keeps the row's chevron
 * and its state mark and gives the rest back to the chart, which is the half
 * of the screen the reader came for. The names are one tap away again.
 */
export const LABEL_WIDTH_COLLAPSED = 64

/**
 * The strip at the bottom of the scroll area that belongs to the scrollbar.
 *
 * A scroll container's last row sits flush against the scrollport edge, which
 * is exactly where the horizontal scrollbar is drawn — over the row on the
 * platforms with overlay scrollbars, and within a pixel of it everywhere else.
 * The grid ends with this much clear space instead.
 */
export const SCROLLBAR_GUTTER = 16

/**
 * The strip the chart keeps past the last day.
 *
 * The timeline ends on the last row's finish, so the bar that *is* that finish
 * ends exactly on the chart's right edge — and everything drawn past a bar's
 * end got clipped there: the selected row's outline, the progress figure, the
 * last axis label. Wide enough for the largest of those.
 */
export const CHART_TAIL = TOUCH_HANDLE_HIT_RADIUS

/**
 * The chart's grid template: the label column, then the timeline. Responsive
 * on the label side only — the timeline is measured in days, not in screen.
 */
export function labelColumns(
  chartWidth: number,
  collapsed = false,
): Record<string, string> {
  if (collapsed) return { base: `${LABEL_WIDTH_COLLAPSED}px ${chartWidth}px` }
  return Object.fromEntries(
    Object.entries(LABEL_WIDTH).map(([breakpoint, width]) => [
      breakpoint,
      `${width}px ${chartWidth}px`,
    ]),
  )
}

/**
 * Pixels per day that make `days` land inside `available` pixels.
 *
 * The fixed zoom ladder (24/8/3 px per day) was built for a window whose width
 * you already know. A tablet does not have one — it has two, and it rotates
 * between them — so this is the step that asks the screen instead of the user.
 *
 * Clamped at both ends: below ~0.4px a bar stops being a bar, and above the
 * day-zoom width there is nothing left to gain from stretching a short build
 * across a wide screen. Falling outside the clamp just means the chart scrolls,
 * which it has always been able to do.
 */
export function fitDayWidth(days: number, available: number): number {
  if (days <= 0 || available <= 0) return 8
  return Math.min(24, Math.max(0.4, available / days))
}

/**
 * The scroll area's height budget. `rowsViewport` means what it says: the rows
 * get it, and the two strips that are not rows — the sticky axis and the
 * scrollbar gutter — are added on top rather than eaten out of it.
 */
export function scrollAreaMaxHeight(rowsViewport = '70vh'): string {
  return `calc(${rowsViewport} + ${AXIS_HEIGHT + SCROLLBAR_GUTTER}px)`
}

/**
 * `70vh` is a fair share of a desktop window and a bad one of a phone held
 * sideways, where it leaves about nine rows once the axis is paid for. Short
 * viewports give the chart more of what little they have, tall ones keep the
 * page around it.
 */
export const SCROLL_AREA_MAX_H = {
  base: scrollAreaMaxHeight('82vh'),
  md: scrollAreaMaxHeight('70vh'),
}

/** The geometry of one row's bar, in chart pixels. */
export interface BarGeometry {
  x: number
  width: number
  delayWidth: number
  y: number
}

/**
 * Which end of each bar a dependency edge attaches to, per PDM relationship
 * type. FS is the default: finish of the predecessor to start of the
 * successor.
 */
export function edgeAnchors(relationshipType: string): {
  from: 'start' | 'end'
  to: 'start' | 'end'
} {
  switch (relationshipType) {
    case 'SS':
      return { from: 'start', to: 'start' }
    case 'FF':
      return { from: 'end', to: 'end' }
    case 'SF':
      return { from: 'start', to: 'end' }
    default:
      return { from: 'end', to: 'start' }
  }
}
