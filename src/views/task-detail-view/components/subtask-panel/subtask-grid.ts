/**
 * The subactivity listing's own template. It follows the activity grid's shape
 * — proportional data tracks, one card-like stack below `lg` — but not its
 * tracks: these rows do not expand (no chevron gutter), their two date columns
 * are one span, and their last cell is *report progress* plus the row menu,
 * which is the pair of things an operator comes to this page to reach.
 *
 * Order: subactivity · avance · estado · prioridad · responsable · fechas ·
 * actions.
 */
export const SUBTASK_GRID_COLUMNS = {
  base: 'minmax(0, 1fr)',
  lg: [
    'minmax(0, 2.4fr)',
    'minmax(7rem, 1.1fr)',
    'minmax(5.5rem, 0.9fr)',
    'minmax(5.5rem, 0.9fr)',
    'minmax(7rem, 1.2fr)',
    'minmax(9rem, 1.4fr)',
    '7.5rem',
  ].join(' '),
}
