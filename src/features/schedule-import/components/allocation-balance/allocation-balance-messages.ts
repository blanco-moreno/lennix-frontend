import { defineMessages } from 'react-intl'

export const allocationBalanceMessages = defineMessages({
  budget: {
    id: 'allocationBalance.budget',
    defaultMessage: 'Budget',
    description:
      'Balance tile: the project budget the split is measured against',
  },
  assigned: {
    id: 'allocationBalance.assigned',
    defaultMessage: 'Assigned',
    description: 'Balance tile: what the main activities add up to',
  },
  unassigned: {
    id: 'allocationBalance.unassigned',
    defaultMessage: 'Unassigned',
    description: 'Balance tile: budget not yet given to any main activity',
  },
  overrun: {
    id: 'allocationBalance.overrun',
    defaultMessage: 'Over budget',
    description:
      'Balance tile: replaces “unassigned” when the split exceeds it',
  },
  noBudget: {
    id: 'allocationBalance.noBudget',
    defaultMessage: 'Not set',
    description: 'Budget tile when the project has no budget',
  },
  overrunNote: {
    id: 'allocationBalance.overrunNote',
    defaultMessage: 'Over by {excess}. You can still activate.',
    description: 'The split exceeds the budget; it does not block go-live',
  },
  noBudgetNote: {
    id: 'allocationBalance.noBudgetNote',
    defaultMessage: 'Enter the project budget to see the balance.',
    description: 'Why there is no remainder tile',
  },
})
