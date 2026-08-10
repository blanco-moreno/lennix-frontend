import { defineMessages } from 'react-intl'

/** Dates and durations: the wording only the activity card's first section
 * renders — plus the two date labels the subactivity form reuses. */
export const taskOverviewTabMessages = defineMessages({
  startDateLabel: {
    id: 'taskDetail.startDateLabel',
    defaultMessage: 'Start date',
    description: 'Generic label for the start-date field',
  },
  dueDateLabel: {
    id: 'taskDetail.dueDateLabel',
    defaultMessage: 'Due date',
    description: 'Generic label for the due-date field',
  },
  noStartDate: {
    id: 'taskDetail.noStartDate',
    defaultMessage: 'No date',
    description: 'Fallback when no start date is set',
  },
  noDueDate: {
    id: 'taskDetail.noDueDate',
    defaultMessage: 'No date',
    description: 'Fallback when no due date is set',
  },
  totalDaysLabel: {
    id: 'taskDetail.totalDaysLabel',
    defaultMessage: 'Total days',
    description: 'Stat label: total days',
  },
  elapsedDaysLabel: {
    id: 'taskDetail.elapsedDaysLabel',
    defaultMessage: 'Elapsed days',
    description: 'Stat label: elapsed days',
  },
  remainingDaysLabel: {
    id: 'taskDetail.remainingDaysLabel',
    defaultMessage: 'Remaining days',
    description: 'Stat label: remaining days',
  },
})
