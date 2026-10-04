/**
 * The three marks a row can carry, defined once.
 *
 * Icons, not worded pills: three pills leave the title 38px of the label
 * column's 260, where icons cost ~50px. An icon only works if the chart says
 * what it means, so the
 * legend renders from this same list. One definition, so a mark and its
 * explanation cannot drift apart.
 */

import {
  Ban,
  CircleHelp,
  Clock,
  Flame,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import type { ScheduleRow } from './gantt-model'
import { scheduleGanttMessages as m } from './schedule-gantt-messages'
import {
  BAR_CRITICAL,
  BAR_DELAY,
  BLOCKED_STROKE,
  EDGE_BROKEN,
} from './schedule-palette'

export const MARK_SIZE = 14

export interface RowMark {
  id: 'critical' | 'blocked' | 'delay' | 'at-risk' | 'over-budget' | 'question'
  icon: LucideIcon
  /** A `gantt.*` CSS variable — the same one the bar it describes uses. */
  color: string
  label: (typeof m)[keyof typeof m]
  /** Whether this row carries the mark. */
  applies: (row: ScheduleRow) => boolean
  /** A draft's mark: the engine marks never apply to one, and this one only does. */
  draft?: boolean
}

export const ROW_MARKS: readonly RowMark[] = [
  {
    id: 'critical',
    icon: TriangleAlert,
    color: BAR_CRITICAL,
    label: m.criticalBadge,
    applies: (row) => row.isCriticalPath,
  },
  {
    id: 'blocked',
    icon: Ban,
    color: BLOCKED_STROKE,
    label: m.blockedBadge,
    applies: (row) => row.isBlocked,
  },
  {
    id: 'delay',
    icon: Clock,
    color: BAR_DELAY,
    label: m.legendDelay,
    applies: (row) => row.delayDays > 0,
  },
  {
    id: 'at-risk',
    icon: Flame,
    color: BAR_DELAY,
    label: m.atRiskBadge,
    applies: (row) => row.atRisk,
  },
  {
    id: 'over-budget',
    icon: Wallet,
    color: EDGE_BROKEN,
    label: m.overBudgetBadge,
    applies: (row) => row.isOverBudget,
  },
  {
    id: 'question',
    icon: CircleHelp,
    color: BAR_DELAY,
    label: m.openQuestionMark,
    applies: (row) => row.openQuestion === true,
    draft: true,
  },
]
