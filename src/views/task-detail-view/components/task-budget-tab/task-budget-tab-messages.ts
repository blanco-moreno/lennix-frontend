import { defineMessages } from 'react-intl'

/** Catalog for the task budget tab — wording only it renders. */
export const taskBudgetTabMessages = defineMessages({
  budgetSummaryHeading: {
    id: 'taskDetail.budgetSummaryHeading',
    defaultMessage: 'Budget summary',
    description: 'Heading of the budget summary section in the budget tab',
  },
  assignedBudgetLabel: {
    id: 'taskDetail.assignedBudgetLabel',
    defaultMessage: 'Assigned budget',
    description: 'Label of the assigned budget figure',
  },
  spentLabel: {
    id: 'taskDetail.spentLabel',
    defaultMessage: 'Spent',
    description: 'Label of the spent figure',
  },
  availableLabel: {
    id: 'taskDetail.availableLabel',
    defaultMessage: 'Available',
    description: 'Label of the available budget figure (when not over budget)',
  },
  overbudgetLabel: {
    id: 'taskDetail.overbudgetLabel',
    defaultMessage: 'Over budget',
    description: 'Label of the over-budget figure (when spent > budget)',
  },
  utilizationLabel: {
    id: 'taskDetail.utilizationLabel',
    defaultMessage: 'Utilization',
    description: 'Label of the utilization percentage',
  },
  varianceHeading: {
    id: 'taskDetail.varianceHeading',
    defaultMessage: 'Budget variance',
    description: 'Heading of the variance section in the budget tab',
  },
  varianceLabel: {
    id: 'taskDetail.varianceLabel',
    defaultMessage: 'Variance',
    description: 'Label of the variance amount cell',
  },
  varianceStatusOverbudget: {
    id: 'taskDetail.varianceStatusOverbudget',
    defaultMessage: 'Over budget',
    description: 'Variance status: spent exceeded the budget',
  },
  varianceStatusOnBudget: {
    id: 'taskDetail.varianceStatusOnBudget',
    defaultMessage: 'In range',
    description: 'Variance status: spent is still within the budget',
  },
  budgetExceededTitle: {
    id: 'taskDetail.budgetExceededTitle',
    defaultMessage: 'Budget exceeded',
    description: 'Title of the budget-exceeded alert',
  },
  budgetExceededBody: {
    id: 'taskDetail.budgetExceededBody',
    defaultMessage:
      'This main activity has exceeded its allocated budget by {amount}.',
    description: 'Body of the budget-exceeded alert',
  },
})
