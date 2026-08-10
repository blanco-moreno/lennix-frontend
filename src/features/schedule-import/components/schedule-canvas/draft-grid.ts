/**
 * The column template the draft schedule listing lays out on: the header, every
 * phase row and every subactivity row. Same idea as `/tasks`'s
 * `TASK_GRID_COLUMNS` (that file is the reference), and deliberately its
 * own constant — a feature cannot import a view, and a draft's columns are not
 * the live listing's: there is no status, no assignee and no progress to show
 * on a schedule the engine has never run.
 *
 * Cell order is fixed: expand · activity · dates · duration · edit. Below `md`
 * both the dates and the duration cells hide and the row says them inline; from
 * `md` the dates come back and only the duration stays folded in. The first
 * track is a 44px touch target until `lg`, where a pointer takes over.
 */
export const DRAFT_GRID_COLUMNS = {
  base: '2.25rem minmax(0, 1fr) 4.5rem',
  lg: '1.75rem minmax(0, 1fr) 13rem 6rem 4.5rem',
}

/** 48px — one activity per row, which is the whole point of a listing. */
export const DRAFT_ROW_MIN_H = '3rem'
