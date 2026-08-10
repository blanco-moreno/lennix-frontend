import type { ColorStyle } from './color-style'
import { statusTone, toneBorderStyle, toneStyle } from './semantic-tone'

/**
 * Activity status → style props, for `<Badge {...getTaskStatusColor(status)} />`.
 *
 * There was a `getProjectStatusColor` beside this one until the colorimetry
 * pass. It is gone: a project's colour comes from the server's verdict
 * (`healthTone`), and a helper that derived one from `status` was an open
 * invitation to judge locally again.
 */
export function getTaskStatusColor(status: string): ColorStyle {
  return toneStyle(statusTone(status))
}

/**
 * The phase's left tick, by precedence.
 *
 * Blocked paints **amber**, not grey: amber means precisely "cannot proceed,
 * someone has to clear it" — which is what blocked *is*, and it is actionable,
 * a call to unblock. So blocked keeps
 * its precedence and gets its own colour instead of disappearing.
 *
 * Once nothing urgent applies, the tick is the activity's own `status` read
 * through `statusTone` — the same vocabulary the badge on the row already
 * uses. A fixed `primary` here paints finished, in-course and not-started work
 * the same navy, under a row that says "completado" in green.
 *
 * `done` is checked before the critical path on purpose. The path is a call to
 * hurry, and there is nothing left to hurry.
 */
export function getTaskGroupBorderColor(task: {
  status?: string
  isCriticalPath?: boolean
  isBlocked?: boolean
  delayedSubtaskCount?: number
}): ColorStyle {
  if (task.isBlocked) return { borderLeftColor: 'warning' }
  if (task.status === 'done') return toneBorderStyle(statusTone(task.status))
  if (task.isCriticalPath) return { borderLeftColor: 'critical' }
  if (task.delayedSubtaskCount && task.delayedSubtaskCount > 0)
    return { borderLeftColor: 'critical' }
  return task.status === undefined
    ? { borderLeftColor: 'primary' }
    : toneBorderStyle(statusTone(task.status))
}

export function getCriticalPathBadgeColor(): ColorStyle {
  return { bg: 'critical', color: 'critical.fg', borderColor: 'critical' }
}

export function getBlockedBadgeColor(): ColorStyle {
  return toneStyle('blocked')
}

/**
 * Deprecated spelling of {@link getBlockedBadgeColor}. Blocked is one state,
 * so it is one colour.
 */
export function getBlockedStatusBadgeColor(): ColorStyle {
  return toneStyle('blocked')
}

export function getTaskGroupContainerColor(blocked: boolean): ColorStyle {
  return blocked
    ? { borderColor: 'border', bg: 'bg.muted/30' }
    : { borderColor: 'border' }
}

export function getDelayBannerContainerColor(): ColorStyle {
  return { borderColor: 'critical/20', bg: 'critical/5' }
}

export function getDelayIconColor(): ColorStyle {
  return { color: 'critical' }
}

export function getForceStartBannerColor(): ColorStyle {
  return { borderColor: 'warning/20', bg: 'warning/5' }
}

export function getForceStartBannerTextColor(): ColorStyle {
  return { color: 'warning' }
}

export function getForceStartIconColor(): ColorStyle {
  return { color: 'warning' }
}

export function getDestructiveActionTextColor(): ColorStyle {
  return { color: 'destructive', _focus: { color: 'destructive' } }
}
