import type { ListFilterKey } from '@/router'

/**
 * The select value that means "do not narrow by this". A cleared select cannot
 * carry an empty string (react-select reads it as "nothing chosen" and shows
 * the placeholder), so the absence is spelled, and translated back to `null`
 * before it ever reaches the URL.
 */
export const FILTER_ALL = 'all'

/**
 * The controls that stay on the bar; everything else the surface answers sits
 * behind "More filters".
 *
 * Twelve selects in a row is a wall, and on a phone it is a wall a screen and
 * a half tall. These three are what a user reaches for without being asked —
 * the rest are a deliberate act, and a deliberate act can afford one click.
 */
export const PRIMARY_FILTERS: readonly ListFilterKey[] = [
  'search',
  'status',
  'project',
]
