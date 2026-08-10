import { defineMessages } from 'react-intl'

/** Catalog for the task expenses tab — wording only it renders. */
export const taskExpensesTabMessages = defineMessages({
  deleting: {
    id: 'taskDetail.deleting',
    defaultMessage: 'Deleting…',
    description: 'Loading label while a delete request is in flight',
  },
  expensesDetailHeading: {
    id: 'taskDetail.expensesDetailHeading',
    defaultMessage: 'Expenses ({count})',
    description: 'Heading of the task expenses tab with the row count',
  },
  expensesSubtaskFilterLabel: {
    id: 'taskDetail.expensesSubtaskFilterLabel',
    defaultMessage: 'Subactivity',
    description: 'Filter label on the task expenses tab',
  },
  expensesAllSubtasks: {
    id: 'taskDetail.expensesAllSubtasks',
    defaultMessage: 'All subactivities',
    description: 'Filter option that disables the subactivity filter',
  },
  expensesRegisterButton: {
    id: 'taskDetail.expensesRegisterButton',
    defaultMessage: 'Register expense',
    description: 'Button on the task expenses tab to open the create modal',
  },
  expensesNoSubtasksTitle: {
    id: 'taskDetail.expensesNoSubtasksTitle',
    defaultMessage: 'No subactivities',
    description:
      'Empty state title when there are no subtasks to log expenses against',
  },
  expensesNoSubtasksDescription: {
    id: 'taskDetail.expensesNoSubtasksDescription',
    defaultMessage:
      'No subactivities yet. Create subactivities to register expenses against them.',
    description: 'Empty state body when there are no subtasks',
  },
  expensesLoadError: {
    id: 'taskDetail.expensesLoadError',
    defaultMessage: 'Could not load expenses.',
    description: 'Error state in the task expenses tab',
  },
  expensesTableEmpty: {
    id: 'taskDetail.expensesTableEmpty',
    defaultMessage: 'No expenses recorded.',
    description: 'DataTable empty placeholder in the task expenses tab',
  },
  expensesDeleteSuccess: {
    id: 'taskDetail.expensesDeleteSuccess',
    defaultMessage: 'Expense deleted successfully',
    description: 'Toast after deleting an expense from the task expenses tab',
  },
  expensesDeleteError: {
    id: 'taskDetail.expensesDeleteError',
    defaultMessage: 'Could not delete the expense',
    description: 'Toast when deleting an expense fails',
  },
  expensesDeleteDialogTitle: {
    id: 'taskDetail.expensesDeleteDialogTitle',
    defaultMessage: 'Delete expense',
    description: 'Title of the delete-expense confirmation dialog',
  },
  expensesDeleteDialogDescription: {
    id: 'taskDetail.expensesDeleteDialogDescription',
    defaultMessage:
      'Are you sure you want to delete "{name}"? This action cannot be undone.',
    description: 'Body of the delete-expense confirmation dialog',
  },
})
