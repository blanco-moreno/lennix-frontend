import { defineMessages } from 'react-intl'

/**
 * The nine words an obra can be described by — the verdict the server computes.
 *
 * A separate catalog from `status-messages.ts` on purpose. A project's `status`
 * is one *input* to the verdict, not the verdict; sharing a catalog is how
 * "completado" ended up meaning two different things. These are the words the
 * user actually reads on a project, and there is exactly one per level.
 *
 * Written for a jefe de obra, not for an operator: "Vencido", not "Overdue
 * state"; "Sobre presupuesto", not "Budget exceeded".
 */
export const healthMessages = defineMessages({
  draft: {
    id: 'health.draft',
    defaultMessage: 'Draft',
    description: 'Project verdict: still under review, not yet a live obra',
  },
  completed: {
    id: 'health.completed',
    defaultMessage: 'Completed',
    description: 'Project verdict: the obra is finished',
  },
  archived: {
    id: 'health.archived',
    defaultMessage: 'Archived',
    description: 'Project verdict: closed and read-only',
  },
  critical: {
    id: 'health.critical',
    defaultMessage: 'Delayed and overdue',
    description:
      'Project verdict: the engine reports a slip AND the due date has passed',
  },
  delayed: {
    id: 'health.delayed',
    defaultMessage: 'Delayed',
    description: 'Project verdict: the schedule engine reports lost days',
  },
  overdue: {
    id: 'health.overdue',
    defaultMessage: 'Overdue',
    description:
      'Project verdict: the due date has passed with no engine-reported slip',
  },
  overBudget: {
    id: 'health.overBudget',
    defaultMessage: 'Over budget',
    description:
      'Project verdict: spending passed the budget, schedule healthy',
  },
  ahead: {
    id: 'health.ahead',
    defaultMessage: 'Ahead of schedule',
    description: 'Project verdict: running faster than planned',
  },
  onTrack: {
    id: 'health.onTrack',
    defaultMessage: 'On time',
    description: 'Project verdict: nothing to report',
  },
  unknown: {
    id: 'health.unknown',
    defaultMessage: 'No data',
    description:
      'Fallback when the backend sends a verdict this client does not know',
  },
})

/**
 * Level → catalog key.
 *
 * The `unknown` fallback is not dead code: the contract can grow a level, and a
 * client one deploy behind must say "no data" rather than guess a word.
 */
export function healthKey(level: string): keyof typeof healthMessages {
  switch (level) {
    case 'draft':
      return 'draft'
    case 'completed':
      return 'completed'
    case 'archived':
      return 'archived'
    case 'critical':
      return 'critical'
    case 'delayed':
      return 'delayed'
    case 'overdue':
      return 'overdue'
    case 'over_budget':
      return 'overBudget'
    case 'ahead':
      return 'ahead'
    case 'on_track':
      return 'onTrack'
    default:
      return 'unknown'
  }
}
