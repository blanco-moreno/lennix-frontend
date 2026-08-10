import { useIntl } from 'react-intl'

import { useDelayReasonLabel } from '@/hooks'
import { useFormatDate } from '@/i18n'

import { type ScheduleRow } from '../../gantt-model'
import { scheduleGanttMessages as m } from '../../schedule-gantt-messages'

/**
 * What a row is, in one sentence.
 *
 * One function, two consumers: the row's `aria-label` and the bar's tooltip.
 * A pointer user and a screen-reader user get the same sentence — a tooltip
 * that said something the accessible name did not would be a second, quieter
 * product.
 *
 * `draft` keeps the sentence to what a draft can claim: dates, the source
 * ref and imported progress — no delay, no on-time verdict, no engine marks.
 */
export function useRowSummary(scope: 'live' | 'draft' = 'live') {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const delayReasonLabel = useDelayReasonLabel()

  return (row: ScheduleRow) => {
    const dates =
      row.startDate || row.dueDate
        ? intl.formatMessage(m.rowDates, {
            start: row.startDate ? formatDate(row.startDate) : '—',
            end: row.dueDate ? formatDate(row.dueDate) : '—',
          })
        : intl.formatMessage(m.undated)

    const level = intl.formatMessage(
      row.level === 'task' ? m.levelTask : m.levelSubtask,
    )
    const progress =
      row.progress > 0
        ? intl.formatMessage(m.rowProgress, {
            progress: Math.round(row.progress),
          })
        : null

    if (scope === 'draft') {
      const base = intl.formatMessage(m.rowAriaDraft, {
        level,
        title: row.title,
        dates,
      })
      const facts = [
        row.ref ? intl.formatMessage(m.rowRef, { ref: row.ref }) : null,
        progress,
      ].filter(Boolean)
      return facts.length > 0 ? `${base}. ${facts.join(' · ')}` : base
    }

    // The count says how late, the reason says why. A row that carries a cause
    // states it here — this sentence is the chart's only place for words.
    const delay =
      row.delayDays > 0
        ? intl.formatMessage(m.delayBadge, { count: row.delayDays })
        : null
    const state =
      delay && row.delayReason
        ? `${delay} · ${delayReasonLabel(row.delayReason)}`
        : (delay ?? intl.formatMessage(m.stateOnTime))

    const marks = [
      progress,
      row.assigneeName
        ? intl.formatMessage(m.rowAssignee, { name: row.assigneeName })
        : null,
      row.location
        ? intl.formatMessage(m.rowLocation, { location: row.location })
        : null,
      row.isCriticalPath ? intl.formatMessage(m.criticalBadge) : null,
      row.isBlocked ? intl.formatMessage(m.blockedBadge) : null,
      row.atRisk ? intl.formatMessage(m.atRiskBadge) : null,
      row.isOverBudget ? intl.formatMessage(m.overBudgetBadge) : null,
    ].filter(Boolean)

    const base = intl.formatMessage(m.rowAria, {
      level,
      title: row.title,
      dates,
      state,
    })

    return marks.length > 0 ? `${base}. ${marks.join(' · ')}` : base
  }
}
