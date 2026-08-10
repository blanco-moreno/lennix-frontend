import { useIntl } from 'react-intl'

import { useStatusLabel, usePriorityLabel } from '@/hooks'
import { useFormatDate } from '@/i18n'
import {
  AT_RISK_LENS,
  listSurfaceStatuses,
  type ListFilterKey,
  type ListSurface,
} from '@/router'
import type { SelectOption } from '@/theme/recipes/select.recipe'

import { FILTER_ALL } from '../../constants'
import { listFilterBarMessages as m } from '../../list-filter-bar-messages'

const PRIORITIES = ['low', 'medium', 'high'] as const

/** Which message names a field. `assignee` is the one that reads per surface. */
const FIELD_LABELS = {
  search: m.fieldSearch,
  status: m.fieldStatus,
  project: m.fieldProject,
  priority: m.fieldPriority,
  assignee: m.fieldAssignee,
  risk: m.fieldRisk,
  blocked: m.fieldBlocked,
  overBudget: m.fieldOverBudget,
  critical: m.fieldCritical,
  dueAfter: m.fieldDueAfter,
  dueBefore: m.fieldDueBefore,
} as const satisfies Record<ListFilterKey, (typeof m)[keyof typeof m]>

/** One label per sort value, both directions — the wire spelling is the key. */
const SORT_LABELS: Record<string, (typeof m)[keyof typeof m]> = {
  created_at: m.sortCreatedAtAsc,
  '-created_at': m.sortCreatedAtDesc,
  name: m.sortNameAsc,
  '-name': m.sortNameDesc,
  title: m.sortTitleAsc,
  '-title': m.sortTitleDesc,
  due_date: m.sortDueDateAsc,
  '-due_date': m.sortDueDateDesc,
  priority: m.sortPriorityAsc,
  '-priority': m.sortPriorityDesc,
  progress: m.sortProgressAsc,
  '-progress': m.sortProgressDesc,
  delay_days: m.sortDelayDaysAsc,
  '-delay_days': m.sortDelayDaysDesc,
}

export interface FilterVocabulary {
  /** What a control is called — and what a chip puts before the colon. */
  fieldLabel: (key: ListFilterKey) => string
  /** What one option of a select is called, given its URL spelling. */
  valueLabel: (key: ListFilterKey, value: string) => string
  optionsFor: (key: ListFilterKey) => SelectOption[]
  sortOptions: (sortKeys: readonly string[]) => SelectOption[]
  sortLabel: (value: string) => string
}

/**
 * The words the filter bar speaks: field names, option names, sort names.
 *
 * Kept apart from the controls because two consumers need the same words for
 * two jobs — the selects render them as options, the chips render them as
 * sentences — and a second copy is how "Priority: high" and "Prioridad: Alta"
 * end up on the same screen.
 */
export function useFilterVocabulary(surface: ListSurface): FilterVocabulary {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const statusLabel = useStatusLabel()
  const priorityLabel = usePriorityLabel()

  const fieldLabel = (key: ListFilterKey): string =>
    intl.formatMessage(
      // The same concept, two words: an obra is led, an activity is assigned.
      key === 'assignee' && surface === 'projects'
        ? m.fieldManager
        : FIELD_LABELS[key],
    )

  const valueLabel = (key: ListFilterKey, value: string): string => {
    switch (key) {
      case 'status':
        return statusLabel(value)
      case 'priority':
        return priorityLabel(value)
      case 'risk':
        return intl.formatMessage(m.optionAtRisk)
      case 'blocked':
      case 'overBudget':
      case 'critical':
        return intl.formatMessage(value === 'true' ? m.optionYes : m.optionNo)
      case 'dueAfter':
      case 'dueBefore':
        // The value is a calendar day (`YYYY-MM-DD`); `useFormatDate` reads it
        // as one, so no timezone can shift the chip off the day the user picked.
        return formatDate(value)
      default:
        return value
    }
  }

  const all = { value: FILTER_ALL, label: intl.formatMessage(m.optionAll) }

  const optionsFor = (key: ListFilterKey): SelectOption[] => {
    switch (key) {
      case 'status':
        return [
          all,
          ...listSurfaceStatuses(surface).map((status) => ({
            value: status,
            label: statusLabel(status),
          })),
        ]
      case 'priority':
        return [
          all,
          ...PRIORITIES.map((priority) => ({
            value: priority,
            label: priorityLabel(priority),
          })),
        ]
      case 'risk':
        return [
          all,
          { value: AT_RISK_LENS, label: intl.formatMessage(m.optionAtRisk) },
        ]
      case 'blocked':
      case 'overBudget':
      case 'critical':
        return [
          all,
          { value: 'true', label: intl.formatMessage(m.optionYes) },
          { value: 'false', label: intl.formatMessage(m.optionNo) },
        ]
      default:
        return [all]
    }
  }

  const sortLabel = (value: string): string => {
    const message = SORT_LABELS[value]
    return message ? intl.formatMessage(message) : value
  }

  const sortOptions = (sortKeys: readonly string[]): SelectOption[] => [
    { value: FILTER_ALL, label: intl.formatMessage(m.sortDefault) },
    ...sortKeys.map((key) => ({ value: key, label: sortLabel(key) })),
  ]

  return { fieldLabel, valueLabel, optionsFor, sortOptions, sortLabel }
}
