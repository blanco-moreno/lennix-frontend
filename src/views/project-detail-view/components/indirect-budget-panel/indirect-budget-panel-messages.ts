import { defineMessages } from 'react-intl'

export const indirectBudgetPanelMessages = defineMessages({
  heading: {
    id: 'indirectBudget.heading',
    defaultMessage: 'Overheads',
    description: 'Heading of the project overheads (gastos generales) section',
  },
  caption: {
    id: 'indirectBudget.caption',
    defaultMessage:
      'What the project spends as a whole rather than on one phase. Each line shares the budget with the phases and has its own alert.',
    description: 'Caption under the overheads heading',
  },
  totals: {
    id: 'indirectBudget.totals',
    defaultMessage:
      'Overheads: {indirect} · Left for phases and overheads: {unallocated}',
    description: 'The overheads total and what the budget has left',
  },
  empty: {
    id: 'indirectBudget.empty',
    defaultMessage: 'This project has no overhead lines.',
    description: 'Shown when the project has no overhead lines',
  },
  lineLabel: {
    id: 'indirectBudget.lineLabel',
    defaultMessage: 'Line',
    description: 'Column header: the overhead line',
  },
  amountLabel: {
    id: 'indirectBudget.amountLabel',
    defaultMessage: 'Budget',
    description: 'Column header: what the line may spend',
  },
  spentLabel: {
    id: 'indirectBudget.spentLabel',
    defaultMessage: 'Spent',
    description: 'Column header: what the line has spent',
  },
  overBudget: {
    id: 'indirectBudget.overBudget',
    defaultMessage: 'Over budget',
    description: 'Badge on a line whose spend passed its amount',
  },
  edit: {
    id: 'indirectBudget.edit',
    defaultMessage: 'Edit {line}',
    description: 'Accessible label of the edit button of one line',
  },
  remove: {
    id: 'indirectBudget.remove',
    defaultMessage: 'Remove {line}',
    description: 'Accessible label of the remove button of one line',
  },
  removeTitle: {
    id: 'indirectBudget.removeTitle',
    defaultMessage: 'Remove the line {line}?',
    description: 'Title of the remove confirmation',
  },
  removeBody: {
    id: 'indirectBudget.removeBody',
    defaultMessage:
      'Its amount goes back to the budget left for phases and overheads.',
    description: 'Body of the remove confirmation',
  },
  removeConfirm: {
    id: 'indirectBudget.removeConfirm',
    defaultMessage: 'Remove line',
    description: 'Confirm button of the remove confirmation',
  },
  addCategory: {
    id: 'indirectBudget.addCategory',
    defaultMessage: 'New line',
    description: 'Label of the category picker for a new line',
  },
  addAmount: {
    id: 'indirectBudget.addAmount',
    defaultMessage: 'Amount',
    description: 'Label of the amount input for a new line',
  },
  add: {
    id: 'indirectBudget.add',
    defaultMessage: 'Add line',
    description: 'Button that adds an overhead line',
  },
  saveSuccess: {
    id: 'indirectBudget.saveSuccess',
    defaultMessage: 'Overhead line saved',
    description: 'Toast after a line is set',
  },
  removeSuccess: {
    id: 'indirectBudget.removeSuccess',
    defaultMessage: 'Overhead line removed',
    description: 'Toast after a line is removed',
  },
  overdrawError: {
    id: 'indirectBudget.overdrawError',
    defaultMessage:
      'That amount does not fit: it is more than the budget has left for phases and overheads.',
    description: 'Toast when a line would exceed the unallocated budget (400)',
  },
  inUseError: {
    id: 'indirectBudget.inUseError',
    defaultMessage:
      'Expenses are filed under this line. Move or delete them before removing it.',
    description: 'Toast when removing a line that has expenses (409)',
  },
  genericError: {
    id: 'indirectBudget.genericError',
    defaultMessage: 'The overhead line could not be saved. Try again.',
    description: 'Toast for any other failure',
  },
  loadError: {
    id: 'indirectBudget.loadError',
    defaultMessage: 'The overheads could not be loaded.',
    description: 'Error state of the overheads section',
  },
})
