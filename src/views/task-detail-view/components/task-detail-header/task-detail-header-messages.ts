import { defineMessages } from 'react-intl'

/** Catalog for the task detail header — wording only it renders. */
export const taskDetailHeaderMessages = defineMessages({
  viewProject: {
    id: 'taskDetail.viewProject',
    defaultMessage: 'View project',
    description: 'Button on the task detail header',
  },
  updateBudget: {
    id: 'taskDetail.updateBudget',
    defaultMessage: 'Update budget',
    description: 'Button on the task detail header',
  },
  requestBudgetAction: {
    id: 'taskDetail.requestBudgetAction',
    defaultMessage: 'Request budget change',
    description:
      'Dropdown action for roles that may only request a budget change (PM/PC)',
  },
  moreActions: {
    id: 'taskDetail.moreActions',
    defaultMessage: 'More actions',
    description:
      'Accessible name of the task detail header menu, which has only an icon',
  },
  editTaskAction: {
    id: 'taskDetail.editTaskAction',
    defaultMessage: 'Edit main activity',
    description: 'Dropdown action on the task detail header',
  },
  deleteTaskAction: {
    id: 'taskDetail.deleteTaskAction',
    defaultMessage: 'Delete main activity',
    description: 'Dropdown action on the task detail header',
  },
  assigneePrefix: {
    id: 'taskDetail.assigneePrefix',
    defaultMessage: 'Manager: {name}',
    description: 'Manager line on the task header (interpolated name)',
  },
  progressExecutionLabel: {
    id: 'taskDetail.progressExecutionLabel',
    defaultMessage: 'Execution progress',
    description: 'Label of the progress bar on the task header',
  },
  taskDeleteDialogTitle: {
    id: 'taskDetail.taskDeleteDialogTitle',
    defaultMessage: 'Delete main activity',
    description: 'Title of the delete-task confirmation dialog',
  },
  taskDeleteDialogDescription: {
    id: 'taskDetail.taskDeleteDialogDescription',
    defaultMessage:
      'Are you sure you want to delete "{name}"? All subactivities and expenses will be removed.',
    description: 'Body of the delete-task confirmation dialog',
  },
  taskDeleteSuccess: {
    id: 'taskDetail.taskDeleteSuccess',
    defaultMessage: 'Main activity deleted',
    description: 'Toast after a task is deleted from the detail page',
  },
  taskDeleteError: {
    id: 'taskDetail.taskDeleteError',
    defaultMessage: 'Could not delete the main activity',
    description: 'Toast when deleting a task fails',
  },
})
