import { defineMessages } from 'react-intl'

export const projectRowMessages = defineMessages({
  overBudgetMark: {
    id: 'projectRow.overBudgetMark',
    defaultMessage: 'Over budget',
    description:
      'Accessible name of the money icon marking an obra that is overspending while its verdict reports something else',
  },
  budgetUnassigned: {
    id: 'projectRow.budgetUnassigned',
    defaultMessage: 'No budget',
    description:
      'The whole money cell when the project has no budget set — nothing is spent against nothing',
  },
  draftStep: {
    id: 'projectRow.draftStep',
    defaultMessage: 'Step {current} of {total} · {step}',
    description: 'Which station of the import wizard a draft was left at',
  },
  stationSchedule: {
    id: 'projectRow.stationSchedule',
    defaultMessage: 'Schedule',
    description: 'Name of the wizard station a draft was left at, in the row',
  },
  stationBudget: {
    id: 'projectRow.stationBudget',
    defaultMessage: 'Budget',
    description: 'Name of the wizard station a draft was left at, in the row',
  },
  stationConfirm: {
    id: 'projectRow.stationConfirm',
    defaultMessage: 'Confirm',
    description: 'Name of the wizard station a draft was left at, in the row',
  },
  dateRange: {
    id: 'projectRow.dateRange',
    defaultMessage: '{start} → {end}',
    description: 'The date span the imported schedule covers',
  },
  spentOf: {
    id: 'projectRow.spentOf',
    defaultMessage: '{amount} spent',
    description:
      'The spent-to-date figure under the budget in the project listing',
  },
  dueInDays: {
    id: 'projectRow.dueInDays',
    defaultMessage: '{days, plural, one {# day left} other {# days left}}',
    description:
      'How long an obra has before its deadline, in the project listing',
  },
  overdueByDays: {
    id: 'projectRow.overdueByDays',
    defaultMessage:
      '{days, plural, one {# day overdue} other {# days overdue}}',
    description:
      'How long ago an obra passed its deadline, in the project listing',
  },
  dueToday: {
    id: 'projectRow.dueToday',
    defaultMessage: 'Due today',
    description: 'Deadline of an obra that falls on today, in the listing',
  },
  moreBadges: {
    id: 'projectRow.moreBadges',
    defaultMessage: '+{hiddenCount}',
    description:
      'Neutral badge standing for the badges that did not fit beside the obra name; opens the obra',
  },
  noDate: {
    id: 'projectRow.noDate',
    defaultMessage: 'No date',
    description: 'Fallback when the project has no date set',
  },
})
