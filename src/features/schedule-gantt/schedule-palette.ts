/**
 * The schedule's own palette. SVG `fill`/`stroke` take no style props, but
 * they DO take CSS custom properties — so every colour here is a
 * `var(--lennix-colors-gantt-*)` reference to the `gantt.*` semantic tokens
 * in `theme.ts`, which is what lets the chart flip with the colour mode.
 * `schedule-palette.test.ts` pins every reference to a token that exists.
 */

const ganttVar = (name: string) => `var(--lennix-colors-gantt-${name})`

/** A task — structural, and it recedes so its subtasks read on top of it. */
export const BAR_TASK = ganttVar('task')

/** A subtask running normally. Blue: the safest hue under every deficiency. */
export const BAR_SUBTASK = ganttVar('subtask')

/** On the critical path. Always drawn with {@link CRITICAL_HATCH_ID} over it. */
export const BAR_CRITICAL = ganttVar('critical')

/**
 * Time run past the baseline. Amber, and always *appended to the end of a bar* —
 * so it is separable from critical by position as well as by hue, which is what
 * keeps the two apart when the hues converge.
 */
export const BAR_DELAY = ganttVar('delay')

/**
 * The progress mark: a thin centre line spanning the reported fraction of the
 * baseline, the same mark MS Project draws. Light-on-dark bars and
 * dark-on-light bars — the token flips with the mode.
 */
export const PROGRESS_MARK = ganttVar('progress')

/** A dependency that points at a row which no longer exists. Drawn dashed. */
export const EDGE_BROKEN = ganttVar('broken')

/**
 * Blocked is drawn as a washed fill *plus* a dashed outline. Opacity alone is a
 * weak signal — it reads as "further away", not as "cannot start".
 */
export const BLOCKED_FILL_OPACITY = 0.4
export const BLOCKED_STROKE = ganttVar('blocked-stroke')
export const BLOCKED_STROKE_DASH = '2 2'

/** The selected row's band, full chart width. Brand, not accent: accent is reserved for the linking gesture. */
export const ROW_SELECTED = ganttVar('row-selected')

/** The hovered row's band — the same idea as {@link ROW_SELECTED}, quieter. */
export const ROW_HOVERED = ganttVar('row-hovered')

/**
 * The selected bar's outline. Deliberately not {@link BLOCKED_STROKE}'s value,
 * and drawn solid and outside the bar where blocked is dashed and on it, so a
 * selected blocked bar still reads as both.
 */
export const BAR_SELECTED_STROKE = ganttVar('selected-stroke')
export const BAR_SELECTED_STROKE_WIDTH = 2

/**
 * The weekend band. Context, not data: it sits behind everything, quieter than
 * a hovered row, so a Saturday can never be read as a row under the pointer.
 */
export const WEEKEND_BAND = ganttVar('weekend')

/**
 * Today. Neutral and dashed — see the token's own note: a reference line that
 * borrowed red or amber would read as something the schedule is saying.
 */
export const TODAY_LINE = ganttVar('today')
export const TODAY_LINE_DASH = '3 3'

/** `<pattern>` id for the critical-path hatch. Defined once per chart. */
export const CRITICAL_HATCH_ID = 'lennix-critical-hatch'

/**
 * `<marker>` id for the arrowhead every edge lands with. Direction is the
 * whole content of a dependency, and the line alone does not carry it: an SS
 * edge anchors start-to-start and an FF edge end-to-end, so the polyline
 * between the two bars is symmetric and says nothing about which one runs
 * first. Only FS is legible from geometry, and only by accident.
 */
export const EDGE_ARROW_ID = 'lennix-edge-arrow'

/**
 * One rule for the label background, the chart band and the bar's outline, so
 * the three views cannot disagree about which row is selected. Hover is state,
 * not CSS `:hover` (label and bar live in different subtrees), and it deepens
 * the state it is over. Values are semantic token names — the Chakra side of
 * the same `gantt.*` roles the SVG reads as vars.
 */
export function rowBackground({
  selected,
  hovered,
}: {
  selected: boolean
  hovered: boolean
}): { bg: string; band: string | null; outline: string | null } {
  if (selected) {
    return {
      bg: hovered ? 'gantt.row-selected-hover' : 'gantt.row-selected',
      band: ROW_SELECTED,
      outline: BAR_SELECTED_STROKE,
    }
  }
  if (hovered) {
    return { bg: 'gantt.row-hovered', band: ROW_HOVERED, outline: null }
  }
  return { bg: 'transparent', band: null, outline: null }
}
