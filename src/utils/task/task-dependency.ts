/**
 * Whether an activity is blocked *for the user* — the one place that rule is
 * written.
 *
 * Structural on purpose: phases, subactivities and the "assigned to me" rows
 * are the same entity one level apart, and every surface that offers the
 * force-start button asks this same question.
 *
 * The backend already stores `is_blocked` as `derived AND NOT force_started`
 * (`update_schedule_projection` in `lennix-ms-bk`), so the second half is
 * belt-and-braces — it keeps the surface honest for the one render between an
 * approval landing and its refetch, and it states the rule without making the
 * reader know the projection.
 */
export function isTaskBlocked(task: {
  isBlocked: boolean
  forceStarted: boolean
}): boolean {
  if (task.forceStarted) return false
  return task.isBlocked
}
