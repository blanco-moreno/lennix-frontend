import { defineMessages } from 'react-intl'

/** Catalog for the task budget modal — wording only it renders. */
export const taskBudgetFormMessages = defineMessages({
  budgetModalTitle: {
    id: 'taskDetail.budgetModalTitle',
    defaultMessage: 'Update budget',
    description: 'Title of the update-task-budget modal',
  },
  budgetModalDescription: {
    id: 'taskDetail.budgetModalDescription',
    defaultMessage: 'Enter the new budget for this main activity.',
    description: 'Subtitle of the update-task-budget modal',
  },
  budgetFieldLabel: {
    id: 'taskDetail.budgetFieldLabel',
    defaultMessage: 'Budget (USD)',
    description: 'Label of the task budget input',
  },
  taskBudgetUpdateSuccess: {
    id: 'taskDetail.taskBudgetUpdateSuccess',
    defaultMessage: 'Budget updated',
    description: 'Toast after updating the task budget',
  },
  taskBudgetUpdateError: {
    id: 'taskDetail.taskBudgetUpdateError',
    defaultMessage: 'Could not update the budget',
    description: 'Toast when updating the task budget fails',
  },
})
