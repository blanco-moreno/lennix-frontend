/**
 * The column template every listing of activities lays out on: the `/tasks`
 * header and rows, the expanded subactivity rows, and the subactivity panel of
 * an activity's own page. One template shared by all of them is what makes a
 * column read as a column down the page — a per-row layout looks aligned until
 * one obra has a long name.
 *
 * Cell order is fixed: expand · activity · progress · status · priority ·
 * context · due —
 * and it is the *same* order at both steps, because a reader who learns a row
 * on the office screen should not have to relearn it on site.
 *
 * Two steps, not three:
 *
 * - `base` — the row is a card: the chevron holds the first column and every
 *   other cell stacks under the name, in that same order, each carrying the
 *   label its column would have had. Nothing is hidden and nothing is clipped,
 *   so it costs height — which a phone has and a table does not.
 * - `lg` — the real columns arrive, and the expand track drops to 1.75rem
 *   because there is a pointer.
 *
 * The step is `lg` (1024px) and not `md`: an iPad mini in portrait is 768px,
 * which is a phone's worth of width holding a tablet's worth of columns. Tablet
 * here means iPad Pro and up.
 *
 * The data columns are proportional, not fixed: `minmax(floor, Nfr)` gives each
 * one a width it cannot fall under and lets the rest of the row share whatever
 * is left. Fixed rem columns spent the same width on a 1280px laptop as on a
 * 2560px monitor and handed the surplus to the name alone, which needs it least
 * once it already fits.
 *
 * There is no actions track any more. Its only button opened the row, which is
 * exactly what tapping the title does — a duplicated affordance costing a
 * quarter of a phone's width.
 */

/** Chevron track, per step. Only reserved where rows actually expand. */
const EXPAND_TRACK = { base: '2.25rem', lg: '1.75rem' } as const

const DATA_TRACKS = {
  base: ['minmax(0, 1fr)'],
  lg: [
    'minmax(0, 2.4fr)',
    'minmax(7rem, 1.1fr)',
    // Estado: 7rem holds "En Progreso" on one line.
    'minmax(7rem, 0.9fr)',
    'minmax(5.5rem, 0.9fr)',
    'minmax(7rem, 1.2fr)',
    'minmax(5.5rem, 0.9fr)',
  ],
} as const

export interface TaskGridOptions {
  /**
   * Whether the listing opens rows in place. The "assigned to me" queue never
   * does — a subactivity has nothing under it — so reserving the chevron track
   * there left 44px of dead gutter on every one of its rows.
   */
  expandable?: boolean
}

export function taskGridColumns({
  expandable = true,
}: TaskGridOptions = {}): Record<string, string> {
  return Object.fromEntries(
    (['base', 'lg'] as const).map((step) => [
      step,
      [...(expandable ? [EXPAND_TRACK[step]] : []), ...DATA_TRACKS[step]].join(
        ' ',
      ),
    ]),
  )
}

/** The default shape: a listing whose rows expand. */
export const TASK_GRID_COLUMNS = taskGridColumns()

/**
 * 52px — one activity per row, which is the whole point of this listing. The
 * card it replaced stood ~200px tall, so a screen held three activities.
 */
export const TASK_ROW_MIN_H = '3.25rem'
