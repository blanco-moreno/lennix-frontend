/**
 * The ONE colour vocabulary for state.
 *
 * Every status, priority, progress-health and approval badge in the app
 * resolves through this file, and this file resolves projects from the
 * **server's verdict**. Judging is not the client's job: when it was, the same
 * obra came out amber on the home and green in the listing, in one session,
 * because each view derived an opinion from whichever fields it happened to
 * carry.
 *
 * The rules, decided once:
 *
 * | tone      | means                                   | colour |
 * |-----------|-----------------------------------------|--------|
 * | `done`    | finished                                 | green  |
 * | `running` | normal, in course, on time               | blue   |
 * | `blocked` | at risk, cannot start, awaiting someone  | amber  |
 * | `danger`  | delayed, overdue, critical, over budget  | red    |
 * | `pending` | not started, cancelled, no signal        | grey   |
 * | `neutral` | metadata that carries no state           | grey   |
 *
 * Three decisions worth not re-litigating:
 *
 * - **Lateness is red, not amber.** Amber reads as a caution; lateness is a
 *   fact, the days are already lost. Amber means only what can still be
 *   prevented.
 * - **Blue is an assertion, never a fallback.** It is shown when the data says
 *   the obra is fine. Anything unknown is grey — a default that claims nothing
 *   is the only default that cannot be wrong.
 * - **Over budget has no colour of its own.** It is red like the rest of the
 *   urgent band, and its *cause* is told apart by a money icon. Shape carries
 *   the reason; hue carries the severity. Same principle as the critical
 *   path's hatch on the Gantt.
 *
 * Brand amber (`complementary`/`accent`) is untouched: its job is action and
 * selection, and it never means state.
 */

import type { ProjectHealthLevel } from '@/types'

import type { ColorStyle } from './color-style'

export type SemanticTone =
  | 'done'
  | 'late'
  | 'blocked'
  | 'pending'
  | 'danger'
  | 'running'
  | 'neutral'

/** The semantic token each tone paints with. */
const TONE_TOKEN: Record<SemanticTone, string | null> = {
  done: 'success',
  late: 'delayed',
  blocked: 'warning',
  pending: null,
  danger: 'critical',
  running: 'info',
  neutral: null,
}

/**
 * Style props for a tone: a tinted fill with the tone's own ink, which stays
 * legible on both grounds because every token behind it is dual-valued.
 * `pending`/`neutral` deliberately have no hue — "nothing to report" should
 * not compete with the states that do.
 */
export function toneStyle(tone: SemanticTone): ColorStyle {
  const token = TONE_TOKEN[tone]
  if (token === null) {
    return { bg: 'bg.muted', color: 'fg.muted', borderColor: 'border' }
  }
  return {
    bg: `${token}/10`,
    color: token,
    borderColor: `${token}/20`,
  }
}

/**
 * The tone as a left tick — a dense row's whole colour budget. Toneless
 * states paint the plain border, so "nothing to report" draws no attention.
 */
export function toneBorderStyle(tone: SemanticTone): ColorStyle {
  return { borderLeftColor: TONE_TOKEN[tone] ?? 'border' }
}

/** The `<Badge variant>` for a tone, for surfaces that take a variant. */
const TONE_VARIANT = {
  done: 'success',
  late: 'delayed',
  blocked: 'warning',
  pending: 'gray',
  danger: 'critical-soft',
  running: 'info',
  neutral: 'gray',
} as const satisfies Record<SemanticTone, string>

export type ToneVariant = (typeof TONE_VARIANT)[SemanticTone]

export function toneVariant(tone: SemanticTone): ToneVariant {
  return TONE_VARIANT[tone]
}

/**
 * The obra's verdict → tone. A lookup, and deliberately nothing else.
 *
 * The backend already applied the precedence — draft over everything, the
 * terminal states over the budget, the schedule over the budget — so there is
 * no tie left to break here. If this function ever needs a second field to
 * decide, the contract is unfinished and the fix belongs on the server.
 */
export function healthTone(level: string): SemanticTone {
  switch (level) {
    case 'completed':
      return 'done'
    case 'on_track':
    case 'ahead':
      return 'running'
    case 'critical':
    case 'delayed':
    case 'overdue':
    case 'over_budget':
      return 'danger'
    case 'draft':
    case 'archived':
      return 'pending'
    default:
      // A level this client has not shipped yet. Grey claims nothing, which is
      // the only honest thing to say about a word we do not know.
      return 'neutral'
  }
}

/** Compile-time proof the table covers the contract; unknown levels stay a runtime concern. */
export type HealthToneLevel = ProjectHealthLevel

/**
 * Activity status → tone. **Tasks and subtasks only.**
 *
 * Projects are judged by `healthTone`: their status is one input to a verdict,
 * not the verdict. The project words are absent on purpose — passing one here
 * resolves to `neutral` rather than to something confidently wrong.
 */
export function statusTone(status: string): SemanticTone {
  switch (status) {
    case 'done':
      return 'done'
    case 'in_progress':
    case 'in-progress':
      return 'running'
    case 'delayed':
    case 'overdue':
      return 'late'
    case 'todo':
    case 'pending':
    // Cancelled work is an absence, not an emergency: red would put a decision
    // already taken in the same band as an obra losing days.
    case 'cancelled':
      return 'pending'
    default:
      return 'neutral'
  }
}

/**
 * Urgency → its own badge variant, in a register the state palette does not use.
 *
 * Priority is an attribute of the work; state is something happening to it.
 * Sharing one palette — medium the same orange as "blocked", high the same red
 * as "delayed" — makes a routine activity look like an emergency. The hues stay
 * (urgency does read as warm), but priority badges are **hollow** where state
 * badges are filled, which is what tells them apart.
 */
const PRIORITY_VARIANT = {
  critical: 'priority-high',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
} as const

export type PriorityVariant =
  (typeof PRIORITY_VARIANT)[keyof typeof PRIORITY_VARIANT]

export function priorityVariant(priority: string): PriorityVariant | 'gray' {
  return PRIORITY_VARIANT[priority as keyof typeof PRIORITY_VARIANT] ?? 'gray'
}

/** Priority as style props, same hollow register as {@link priorityVariant}. */
export function priorityStyle(priority: string): ColorStyle {
  const token = {
    critical: 'priority.high',
    high: 'priority.high',
    medium: 'priority.medium',
    low: 'priority.low',
  }[priority]

  if (token === undefined) {
    return { bg: 'bg.muted', color: 'fg.muted', borderColor: 'border' }
  }
  return { bg: 'transparent', color: token, borderColor: `${token}/40` }
}

/** A decision someone is waiting on → tone. */
export function approvalTone(status: string): SemanticTone {
  switch (status) {
    case 'approved':
      return 'done'
    case 'rejected':
      return 'danger'
    case 'pending':
      return 'blocked'
    default:
      return 'neutral'
  }
}
