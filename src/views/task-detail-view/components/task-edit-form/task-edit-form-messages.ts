import { defineMessages } from 'react-intl'

/** Catalog for the task edit modal — wording only it renders. */
export const taskEditModalMessages = defineMessages({
  saveChanges: {
    id: 'taskDetail.saveChanges',
    defaultMessage: 'Save changes',
    description: 'Submit label for the task edit modal',
  },
  taskEditTitle: {
    id: 'taskDetail.taskEditTitle',
    defaultMessage: 'Edit main activity',
    description: 'Title of the task edit modal',
  },
  taskEditDescription: {
    id: 'taskDetail.taskEditDescription',
    defaultMessage: 'General information of this activity in “{project}”.',
    description: 'Subtitle of the task edit modal — names the parent project',
  },
  budgetLabel: {
    id: 'taskDetail.taskEditBudgetLabel',
    defaultMessage: 'Budget',
    description: 'Label of the budget field in the task edit drawer',
  },
  taskTitleLabel: {
    id: 'taskDetail.taskTitleLabel',
    defaultMessage: 'Main activity title',
    description: 'Label of the task title input',
  },
  taskTitlePlaceholder: {
    id: 'taskDetail.taskTitlePlaceholder',
    defaultMessage: 'Main activity title',
    description: 'Placeholder of the task title input',
  },
  taskDescriptionPlaceholder: {
    id: 'taskDetail.taskDescriptionPlaceholder',
    defaultMessage: 'Detailed description of the main activity',
    description: 'Placeholder of the task description textarea',
  },
  taskUpdateSuccess: {
    id: 'taskDetail.taskUpdateSuccess',
    defaultMessage: 'Main activity updated',
    description: 'Toast after updating an activity',
  },
  taskUpdateError: {
    id: 'taskDetail.taskUpdateError',
    defaultMessage: 'Could not update the main activity',
    description: 'Toast when updating an activity fails',
  },
})
