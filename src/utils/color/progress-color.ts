/**
 * Progress colour says how healthy this is, not how much is done.
 *
 * Activities only. A second judgement of **projects** here, with its own
 * precedence and reading of `status`, makes the bar and the badge on one row
 * two opinions that disagree — a project's bar paints from the server's
 * verdict, see `healthTone`.
 */

import type { ColorStyle } from './color-style'
import { healthTone, toneStyle, type SemanticTone } from './semantic-tone'

/** What the colour is allowed to say: three states, no more. */
export type ProgressHealth = 'late' | 'on_time' | 'pending'

/** The subset of an activity the rule needs — works for tasks and subtasks. */
export interface ProgressHealthInput {
  status: string
  progress: number
  delayDays: number
  isBlocked: boolean
  /**
   * `Task.at_risk` — which means **force-started**, not "looks risky".
   *
   * The name is the backend's and it is a provenance flag: this activity was
   * started before its predecessors allowed it. It counts as late here because
   * work begun out of order is work whose schedule is already not being kept.
   */
  atRisk: boolean
}

/**
 * Schedule health for an activity or a phase.
 *
 * The precedence collapses to what a bar can express: anything that says the
 * schedule is not being kept reads `late`.
 */
export function resolveProgressHealth(
  task: ProgressHealthInput,
): ProgressHealth {
  if (task.isBlocked || task.atRisk || task.delayDays > 0) return 'late'
  if (task.status === 'done' || task.progress > 0) return 'on_time'
  return 'pending'
}

/**
 * A project's progress bar, straight from the server's verdict.
 *
 * No precedence, no reading of `status`, no second guess: the tone is the same
 * one the row's badge and left tick use, so a project cannot be red in one
 * place and green two centimetres away.
 */
export function getProjectProgressColor(healthLevel: string): ColorStyle {
  const tone = healthTone(healthLevel)
  // `pending`/`neutral` return no `bg`, same as an activity that has not
  // started: a coloured bar at zero width would be an empty claim.
  return tone === 'pending' || tone === 'neutral'
    ? {}
    : { bg: TONE_BAR_TOKEN[tone] }
}

const TONE_BAR_TOKEN: Record<
  Exclude<SemanticTone, 'pending' | 'neutral'>,
  string
> = {
  done: 'success',
  running: 'info',
  blocked: 'warning',
  late: 'delayed',
  danger: 'critical',
}

/**
 * The bar's fill.
 *
 * `pending` returns no `bg` at all rather than a muted one: nothing has happened
 * yet, and a coloured bar at zero width would be an empty claim.
 */
export function getProgressColor(health: ProgressHealth): ColorStyle {
  switch (health) {
    case 'late':
      // Amber, matching the Gantt's slipped-time segment: a late bar and a
      // late row now say the same thing in the same colour.
      return { bg: 'delayed' }
    case 'on_time':
      return { bg: 'success' }
    case 'pending':
      return {}
  }
}

/** The same rule in a badge's subtler register. */
export function getProgressBadgeColor(health: ProgressHealth): ColorStyle {
  switch (health) {
    case 'late':
      return toneStyle('late')
    case 'on_time':
      return toneStyle('done')
    case 'pending':
      return toneStyle('pending')
  }
}
