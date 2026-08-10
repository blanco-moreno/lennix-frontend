/**
 * The one column template of the papelera listing — the header and every row
 * lay out on it, the same contract as the obra and activity listings.
 * Tracks: select · what was deleted · when · restore/purge actions.
 *
 * The template is per breakpoint because hiding a cell does not remove its
 * track: a `display:none` date cell still let the `1fr` track charge its share
 * of a 375px row, leaving the name under 60px. Below `md` the template only
 * declares the two tracks that render — the touch-sized checkbox and the name.
 */
export const TRASH_GRID_COLUMNS = {
  base: '2.25rem minmax(0, 1fr)',
  lg: '2rem minmax(0, 2fr) minmax(0, 1fr) auto',
}
