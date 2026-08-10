/**
 * The column template every dense listing of obras lays out on: the header and
 * every row, on `/projects`, on `/drafts` and on the dashboard alike. One
 * template shared by all of them is what makes a column read as a column down
 * the page — a per-row layout looks aligned until one obra has a long name.
 *
 * Cell order is fixed: select · identity · project · signal · state · time ·
 * money — and it is the same order at both steps, so the row a reader learns
 * in the office is the row they read on site.
 *
 * Two steps, not three. On `base` the row is a card: the tile holds its column
 * and every other cell stacks under the name, in that order, each carrying the
 * label its column would have had. On `lg` the real columns arrive. The step is
 * `lg` (1024px) rather than `md`, because an iPad mini in portrait is 768px —
 * a phone's width being asked to hold a tablet's columns. Tablet here means
 * iPad Pro and up.
 *
 * The selection track is 2.25rem below `lg` and 2rem where there is a mouse. It
 * is only
 * reserved where the listing actually selects — `/projects` and the dashboard
 * do not, and a track they never fill was 56px of dead gutter on every row.
 *
 * The data columns are proportional, not fixed: `minmax(floor, Nfr)` gives each
 * one a width it cannot fall under and lets the rest of the row share whatever
 * is left, instead of spending the same rem on a laptop and on a 2560px screen.
 *
 * Two tracks carry different facts per listing, which is the point: a draft
 * has no avance and no deadline, so `signal` draws how far its review got and
 * `time` how long it has been waiting. Same skeleton, same places to look —
 * what a live obra answers with money and dates, a draft answers with its
 * station and its age.
 *
 * The `select` track is empty wherever nothing is selectable, and the leading
 * identity tile is what tells an obra from an activity at a glance: `/tasks`
 * opens its rows with a chevron (hierarchy — there is something to expand),
 * these open them with a thing that has a name.
 *
 * There is no trailing actions track: the row's only destination is the one the
 * name already opens, so a column reserving room for a duplicate of it was
 * spending the width the obra's name needed.
 */
/** Selection track, per step. Only reserved where the listing selects. */
const SELECT_TRACK = { base: '2.25rem', lg: '2rem' } as const

const DATA_TRACKS = {
  base: ['2.5rem', 'minmax(0, 1fr)'],
  lg: [
    '2.5rem',
    'minmax(0, 2.4fr)',
    'minmax(8rem, 1.4fr)',
    'minmax(5.5rem, 1fr)',
    'minmax(6rem, 1.1fr)',
    'minmax(7rem, 1.2fr)',
  ],
} as const

export interface ProjectGridOptions {
  /** Whether the listing offers bulk selection — only `/drafts` does. */
  selectable?: boolean
}

export function projectGridColumns({
  selectable = false,
}: ProjectGridOptions = {}): Record<string, string> {
  return Object.fromEntries(
    (['base', 'lg'] as const).map((step) => [
      step,
      [...(selectable ? [SELECT_TRACK[step]] : []), ...DATA_TRACKS[step]].join(
        ' ',
      ),
    ]),
  )
}

/** The default shape: a listing that only reads. */
export const PROJECT_GRID_COLUMNS = projectGridColumns()

/**
 * 76px — one obra per row, on two lines. An activity row is 52px and one line
 * because an activity is a title and a state; an obra also has an owner, a
 * place, and money moving against its progress. The taller row is the
 * difference being visible, not decoration: it costs ~5 items per screen and
 * buys a listing you cannot mistake for `/tasks`.
 */
export const PROJECT_ROW_MIN_H = '4.75rem'

/**
 * 6rem — every bar in a listing row is the same length, avance or gasto, so
 * two rows can be compared by eye. Stretching each bar to its column made a
 * 30% avance look longer than a 60% gasto purely because the column was wider.
 */
export const ROW_PROGRESS_BAR_W = '6rem'
