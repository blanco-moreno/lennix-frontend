import { defineMessages } from 'react-intl'

export const listCellsMessages = defineMessages({
  unassigned: {
    id: 'taskCell.unassigned',
    defaultMessage: 'Unassigned',
    description: 'Placeholder in the assignee column when nobody is assigned',
  },
  noDueDate: {
    id: 'taskCell.noDueDate',
    defaultMessage: 'No date',
    description: 'Placeholder in the due-date column when the row has no date',
  },
  noProgress: {
    id: 'taskCell.noProgress',
    defaultMessage: 'No progress',
    description: 'Shown instead of a 0% bar, which reads as a started row',
  },
  progressValue: {
    id: 'taskCell.progressValue',
    defaultMessage: '{percent} complete',
    description:
      'Accessible label of the inline progress bar of a row; {percent} is already formatted',
  },
})
