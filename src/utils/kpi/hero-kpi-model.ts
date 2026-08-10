/**
 * The one KPI system: the only metric set the app renders, built from the
 * schedule engine's own signals. One datum, one place — nothing here is also
 * rendered as a KPI elsewhere; the numbers are the backend's.
 */

import {
  AlertTriangle,
  Clock,
  GitBranch,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { MessageDescriptor } from 'react-intl'

import { buildAtRiskTasksPath } from '@/router'
import type { OrganizationDashboard, ProjectDashboard } from '@/types'

import { heroKpiMessages as m } from './hero-kpi-model-messages'

export type HeroKpiId =
  | 'delayedProjects'
  | 'criticalPathSlip'
  | 'atRiskTasks'
  | 'activationWait'
  | 'projectProgress'
  | 'budgetUsed'

/** `count` renders the raw number; `days` a duration; `percent` a fraction of 100. */
export type HeroKpiUnit = 'count' | 'days' | 'percent'

export interface HeroKpi {
  id: HeroKpiId
  label: MessageDescriptor
  icon: LucideIcon
  /** Drives `StatCard`'s icon colors. */
  semantic: string
  /** `null` means "no datum to report" — rendered as such, never as a zero. */
  value: number | null
  unit: HeroKpiUnit
  /**
   * Where the number goes when it is clicked. Optional: a KPI without a
   * surface that lists the same population is honestly a dead end, and a link
   * to an approximation would be worse than none.
   */
  href?: string
}

/**
 * Graduated transparency: a signal at zero is good news and reads quiet; a
 * signal above zero is the reason the user opened the app.
 */
function tone(value: number | null, loud: string): string {
  return value !== null && value > 0 ? loud : 'success'
}

/** The portfolio set — the dashboard's answer to "where do I look today?". */
export function buildPortfolioKpis(
  dashboard: OrganizationDashboard | undefined,
): HeroKpi[] {
  if (!dashboard) return []
  return [
    {
      id: 'delayedProjects',
      label: m.delayedProjects,
      icon: TrendingDown,
      semantic: tone(dashboard.delayedProjects, 'critical'),
      value: dashboard.delayedProjects,
      unit: 'count',
    },
    {
      id: 'criticalPathSlip',
      label: m.criticalPathSlip,
      icon: GitBranch,
      semantic: tone(dashboard.criticalPathSlipDays, 'critical'),
      value: dashboard.criticalPathSlipDays,
      unit: 'days',
    },
    {
      id: 'atRiskTasks',
      label: m.atRiskTasks,
      icon: AlertTriangle,
      semantic: tone(dashboard.delayedOrBlockedTasks, 'warning'),
      value: dashboard.delayedOrBlockedTasks,
      unit: 'count',
      // Drills into `/tasks`, on the **portfolio list** tab: `_count_delayed_or_blocked_tasks`
      // counts live *top-level* activities across *every* project, which is
      // exactly the population that tab enumerates. The "assigned to me" tab
      // holds subactivities and only the caller's, so it could never contain
      // the number printed here.
      href: buildAtRiskTasksPath(),
    },
    {
      // The observable half of time-to-usable-schedule. It is the *age*
      // of the oldest pending draft, not how many there are: the count has one
      // home already — the drafts nudge and the Borradores quota meter.
      id: 'activationWait',
      label: m.activationWait,
      icon: Clock,
      semantic: tone(dashboard.oldestDraftAgeDays, 'info'),
      value: dashboard.oldestDraftAgeDays,
      unit: 'days',
    },
  ]
}

/**
 * The project set — deliberately just the two schedule signals. Progress,
 * dates, budget, team and status are not KPIs here; they have their own homes
 * on the project screen, and repeating them as tiles is exactly the duplication
 * this system replaced.
 */
export function buildProjectKpis(
  dashboard: ProjectDashboard | undefined,
): HeroKpi[] {
  if (!dashboard) return []
  return [
    {
      // The verdict number a site manager reads first. Quiet on purpose:
      // progress is a fact, not an alarm.
      id: 'projectProgress',
      label: m.projectProgress,
      icon: TrendingUp,
      semantic: 'info',
      value: Math.round(dashboard.overallProgress),
      unit: 'percent',
    },
    {
      id: 'criticalPathSlip',
      label: m.criticalPathSlip,
      icon: GitBranch,
      semantic: tone(dashboard.criticalPathSlipDays, 'critical'),
      value: dashboard.criticalPathSlipDays,
      unit: 'days',
    },
    {
      // No `href`, deliberately: the portfolio tile drills into the
      // cross-project list, and this one is already *on* the project whose
      // activities the schedule tab lists a scroll away. A link from here to a
      // portfolio-wide surface would widen the question instead of answering it.
      id: 'atRiskTasks',
      label: m.atRiskTasks,
      icon: AlertTriangle,
      semantic: tone(dashboard.delayedOrBlockedTasks, 'warning'),
      value: dashboard.delayedOrBlockedTasks,
      unit: 'count',
    },
    {
      // "Am I over budget?" is a front-page question for a manager, not a
      // tab question. Null when the project has no budget — an honest "no
      // datum", never a fake 0%.
      id: 'budgetUsed',
      label: m.budgetUsed,
      icon: Wallet,
      semantic: dashboard.isOverBudget ? 'critical' : 'info',
      value:
        dashboard.budget !== null && dashboard.budget > 0
          ? Math.round((dashboard.spent / dashboard.budget) * 100)
          : null,
      unit: 'percent',
    },
  ]
}
