import { defineMessages } from 'react-intl'

export const projectListHeaderMessages = defineMessages({
  columnProject: {
    id: 'projectListHeader.columnProject',
    defaultMessage: 'Project',
    description: 'Column header over the obra name in the dense project list',
  },
  columnProgress: {
    id: 'projectListHeader.columnProgress',
    defaultMessage: 'Progress',
    description: 'Column header over the avance bars in the dense project list',
  },
  columnStatus: {
    id: 'projectListHeader.columnStatus',
    defaultMessage: 'Status',
    description:
      'Column header over the status badge in the dense project list',
  },
  columnDeadline: {
    id: 'projectListHeader.columnDeadline',
    defaultMessage: 'Deadline',
    description: 'Column header over the due date in the dense project list',
  },
  columnBudget: {
    id: 'projectListHeader.columnBudget',
    defaultMessage: 'Budget',
    description: 'Column header over the budget figure in the project list',
  },
  columnReview: {
    id: 'projectListHeader.columnReview',
    defaultMessage: 'Review',
    description:
      'Column header over how far a draft got through the import wizard',
  },
  columnWaiting: {
    id: 'projectListHeader.columnWaiting',
    defaultMessage: 'Waiting',
    description:
      'Column header over how long a draft has been waiting to be activated',
  },
})
