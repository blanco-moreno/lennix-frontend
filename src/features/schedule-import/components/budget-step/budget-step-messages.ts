import { defineMessages } from 'react-intl'

export const budgetStepMessages = defineMessages({
  projectBudgetLabel: {
    id: 'budgetStep.projectBudgetLabel',
    defaultMessage: 'Project budget',
    description: 'Label of the project-level budget input',
  },
  emptyTitle: {
    id: 'budgetStep.emptyTitle',
    defaultMessage: 'No main activities to budget',
    description: 'Shown when the draft has no main activities',
  },
})
