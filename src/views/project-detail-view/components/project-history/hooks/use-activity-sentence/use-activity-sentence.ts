import { useIntl } from 'react-intl'

import { useProjectCurrency, useStatusLabel } from '@/hooks'
import { useFormatDate } from '@/i18n'
import type { ProjectActivity, ProjectActivityAction } from '@/types'
import { parseMoney } from '@/utils'

import {
  ACTIVITY_ACTION_MESSAGES,
  activityMessages,
} from '../../project-history-messages'

/**
 * Turns one Historial row into one translated sentence. A status key resolves
 * through the shared status catalog and an amount is formatted as money (per
 * placeholder — see `moneyPlaceholders`); an unknown action falls back to a
 * translated generic sentence, never a raw key.
 */

/**
 * Which placeholders carry an amount, per action — decided per placeholder
 * because a row can carry an amount in one and a title in the other
 * (`expense.recorded` puts the amount in `new` and a title in `old`).
 */
/** How the backend joins the two ends of a rescheduled span. */
const DATE_RANGE_SEPARATOR = ' → '

function moneyPlaceholders(action: ProjectActivityAction): {
  old: boolean
  new: boolean
} {
  switch (action) {
    // `old` is the subactivity the expense hangs off, not an amount.
    case 'expense.recorded':
      return { old: false, new: true }
    // Budget before → after.
    case 'project.budget_changed':
    case 'budget_approval.requested':
    case 'budget_approval.approved':
    case 'budget_approval.rejected':
      return { old: true, new: true }
    // A budget crossing: `old` is the budget, `new` is what has been spent.
    case 'task.over_budget':
    case 'task.within_budget':
    case 'project.over_budget':
    case 'project.within_budget':
      return { old: true, new: true }
    default:
      return { old: false, new: false }
  }
}

export function useActivitySentence(): (entry: ProjectActivity) => string {
  const intl = useIntl()
  const statusLabel = useStatusLabel()
  const formatDate = useFormatDate()
  // The Historial is the project's page: its amounts are in its currency.
  const { formatMoney } = useProjectCurrency()

  return (entry) => {
    const descriptor =
      ACTIVITY_ACTION_MESSAGES[entry.action] ?? activityMessages.unknownAction

    const isStatusChange = entry.action.endsWith('.status_changed')
    // A reschedule carries the span as `start → end`, both ISO, either side
    // possibly absent (the backend writes a literal 'None' for a missing one).
    const isReschedule = entry.action.endsWith('.rescheduled')
    const money = moneyPlaceholders(entry.action)

    const readable = (value: string | null, isMoney: boolean): string => {
      if (value === null) return ''
      if (isStatusChange) return statusLabel(value)
      if (isMoney) return formatMoney(parseMoney(value))
      if (isReschedule)
        return value
          .split(DATE_RANGE_SEPARATOR)
          .map((day) => (day === 'None' ? '—' : formatDate(day.trim())))
          .join(DATE_RANGE_SEPARATOR)
      return value
    }

    return intl.formatMessage(descriptor, {
      actor:
        entry.actorName ?? intl.formatMessage(activityMessages.systemActor),
      entity:
        entry.entityName ?? intl.formatMessage(activityMessages.unnamedEntity),
      old: readable(entry.oldValue, money.old),
      new: readable(entry.newValue, money.new),
      hasOld: entry.oldValue === null ? 'no' : 'yes',
    })
  }
}
