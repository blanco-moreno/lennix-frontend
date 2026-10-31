import { defineMessages } from 'react-intl'

export const projectExpenseCreateModalMessages = defineMessages({
  indirectLabel: {
    id: 'projectExpenseCreate.indirectLabel',
    defaultMessage: 'Overhead line',
    description:
      'Label of the optional overhead line a project expense is filed under',
  },
  indirectNone: {
    id: 'projectExpenseCreate.indirectNone',
    defaultMessage: 'Not an overhead',
    description: 'Option: the expense is not filed under any overhead line',
  },
})
