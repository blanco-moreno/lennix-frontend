import { defineMessages } from 'react-intl'

/** Catalog for the project budget panel — wording only it renders. */
export const projectBudgetPanelMessages = defineMessages({
  budgetUnassigned: {
    id: 'projectDetail.budgetUnassigned',
    defaultMessage: 'Unassigned',
    description: 'Fallback when the project budget is not set',
  },
  budgetNa: {
    id: 'projectDetail.budgetNa',
    defaultMessage: 'N/A',
    description: 'Placeholder when no budget metric is available',
  },
  budgetPanelError: {
    id: 'projectDetail.budgetPanelError',
    defaultMessage: 'Could not load the budget.',
    description: 'Error state of the budget panel',
  },
  totalBudgetLabel: {
    id: 'projectDetail.totalBudgetLabel',
    defaultMessage: 'Total budget',
    description: 'Label of the total budget figure',
  },
  spentLabel: {
    id: 'projectDetail.spentLabel',
    defaultMessage: 'Spent',
    description: 'Label of the spent figure',
  },
  overbudgetLabel: {
    id: 'projectDetail.overbudgetLabel',
    defaultMessage: 'Over budget',
    description: 'Label shown when spent exceeds the budget',
  },
  remainingLabel: {
    id: 'projectDetail.remainingLabel',
    defaultMessage: 'Remaining',
    description: 'Label of the remaining budget figure',
  },
  utilizationLabel: {
    id: 'projectDetail.utilizationLabel',
    defaultMessage: 'Utilization',
    description: 'Label of the utilization percentage',
  },
  utilizationSuffix: {
    id: 'projectDetail.utilizationSuffix',
    defaultMessage: 'used',
    description: 'Inline suffix after the utilization percentage',
  },
  budgetExceededTitle: {
    id: 'projectDetail.budgetExceededTitle',
    defaultMessage: 'Budget exceeded',
    description: 'Title of the budget-exceeded alert',
  },
  budgetExceededBody: {
    id: 'projectDetail.budgetExceededBody',
    defaultMessage: 'The project has exceeded the budget by {amount}.',
    description: 'Body of the budget-exceeded alert',
  },
})
