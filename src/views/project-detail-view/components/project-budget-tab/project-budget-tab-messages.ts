import { defineMessages } from 'react-intl'

/** Catalog for the project budget tab — wording only it renders. */
export const projectBudgetTabMessages = defineMessages({
  budgetControlHeading: {
    id: 'projectDetail.budgetControlHeading',
    defaultMessage: 'Budget control',
    description: 'Primary heading of the budget tab',
  },
  budgetSectionCaption: {
    id: 'projectDetail.budgetSectionCaption',
    defaultMessage:
      'The single place the project budget is set and read. Use "Update budget" above to change it.',
    description: 'Caption under the primary budget block of the budget tab',
  },
  costReportSectionHeading: {
    id: 'projectDetail.costReportSectionHeading',
    defaultMessage: 'Cost report',
    description: 'Heading of the secondary block of the budget tab',
  },
  costReportSectionCaption: {
    id: 'projectDetail.costReportSectionCaption',
    defaultMessage: 'Where that budget is going, by category and by activity.',
    description: 'Caption of the cost-report block of the budget tab',
  },
  expensesSectionCaption: {
    id: 'projectDetail.expensesSectionCaption',
    defaultMessage: 'Every expense behind the figures above.',
    description: 'Caption of the expense-list block of the budget tab',
  },
})
