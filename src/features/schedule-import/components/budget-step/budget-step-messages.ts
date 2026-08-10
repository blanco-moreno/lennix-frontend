import { defineMessages } from 'react-intl'

export const budgetStepMessages = defineMessages({
  title: {
    id: 'budgetStep.title',
    defaultMessage: 'Split the budget',
    description: 'Heading of the budget step of the import wizard',
  },
  explainer: {
    id: 'budgetStep.explainer',
    defaultMessage:
      'Optional. Give each main activity its share — you can change every number after the project is live.',
    description: 'States that the budget step blocks nothing',
  },
  projectBudgetLabel: {
    id: 'budgetStep.projectBudgetLabel',
    defaultMessage: 'Project budget',
    description: 'Label of the whole-project budget field',
  },
  perTaskTitle: {
    id: 'budgetStep.perTaskTitle',
    defaultMessage: 'Budget per main activity',
    description: 'Heading of the per-task budget list',
  },
  totals: {
    id: 'budgetStep.totals',
    defaultMessage: 'Assigned {assigned} · {unassigned} still unassigned',
    description:
      'Running totals while the project budget still covers the split',
  },
  totalsOverrun: {
    id: 'budgetStep.totalsOverrun',
    defaultMessage:
      'Assigned {assigned} — {excess} over the project budget. You can still activate; the numbers stay editable afterwards.',
    description:
      'States that the split exceeds the project budget without blocking',
  },
  totalsWithoutBudget: {
    id: 'budgetStep.totalsWithoutBudget',
    defaultMessage:
      'Assigned {assigned} · set a project budget to see what is left',
    description: 'Totals line when the project carries no budget to draw on',
  },
  emptyTitle: {
    id: 'budgetStep.emptyTitle',
    defaultMessage: 'No activities to budget yet',
    description: 'Empty state of the budget step',
  },
  emptyDescription: {
    id: 'budgetStep.emptyDescription',
    defaultMessage:
      'Once Lennix reads main activities from your file, they show up here.',
    description: 'Empty state body of the budget step',
  },
  balanceBudget: {
    id: 'budgetStep.balanceBudget',
    defaultMessage: 'Budget',
    description: 'Balance panel: the whole-project amount',
  },
  balanceAssigned: {
    id: 'budgetStep.balanceAssigned',
    defaultMessage: 'Assigned',
    description: 'Balance panel: what the split adds up to',
  },
  balanceUnassigned: {
    id: 'budgetStep.balanceUnassigned',
    defaultMessage: 'Unassigned',
    description: 'Balance panel: what the project budget still has left',
  },
  balanceOverrun: {
    id: 'budgetStep.balanceOverrun',
    defaultMessage: 'Over budget',
    description:
      'Balance panel: replaces “unassigned” when the split exceeds it',
  },
  balanceNoBudget: {
    id: 'budgetStep.balanceNoBudget',
    defaultMessage: 'Not set',
    description: 'Balance panel: the draft carries no project budget',
  },
})
