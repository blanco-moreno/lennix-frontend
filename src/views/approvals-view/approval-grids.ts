/**
 * The column templates of the approvals listings — each section's header and
 * rows lay out on one template, the same contract as every other listing.
 *
 * The templates are mobile first: a hidden cell (`hideBelow`) is `display:none`
 * and is therefore never placed, but its track stays in the template and keeps
 * charging its `1fr`. A flat six-track template on a 375px screen left the
 * request name ~24px wide while invisible tracks ate the rest, so each step
 * declares only the tracks that exist at that step.
 *
 * Budget — base: request. md: request · requested · delta · actions (what an
 * approver needs to decide). lg: adds previous amount and request date.
 * Force-start — base: request. md and up: request · date · actions.
 */
export const BUDGET_APPROVAL_GRID_COLUMNS = {
  base: 'minmax(0, 1fr)',
  lg: 'minmax(0, 2.5fr) repeat(4, minmax(0, 1fr)) auto',
}

export const FORCE_START_GRID_COLUMNS = {
  base: 'minmax(0, 1fr)',
  lg: 'minmax(0, 3fr) minmax(0, 1fr) auto',
}
