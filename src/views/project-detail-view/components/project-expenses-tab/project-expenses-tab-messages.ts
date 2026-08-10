import { defineMessages } from 'react-intl'

/** Catalog for the project expenses tab — wording only it renders. */
export const projectExpensesTabMessages = defineMessages({
  expensesDetailHeading: {
    id: 'projectDetail.expensesDetailHeading',
    defaultMessage: 'Expenses ({count})',
    description: 'Heading of the project expenses tab with the row count',
  },
  expensesLoadError: {
    id: 'projectDetail.expensesLoadError',
    defaultMessage: 'Could not load expenses.',
    description: 'Error state in the project expenses tab',
  },
  noExpensesFound: {
    id: 'projectDetail.noExpensesFound',
    defaultMessage: 'No expenses match the selected filters.',
    description: 'Empty state in the project expenses tab',
  },
  filterTaskLabel: {
    id: 'projectDetail.filterTaskLabel',
    defaultMessage: 'Main activity',
    description: 'Filter label: activity',
  },
  filterAllTasks: {
    id: 'projectDetail.filterAllTasks',
    defaultMessage: 'All main activities',
    description: 'Filter option that disables the activity filter',
  },
  filterSubtaskLabel: {
    id: 'projectDetail.filterSubtaskLabel',
    defaultMessage: 'Subactivity',
    description: 'Filter label: subactivity',
  },
  filterAllSubtasks: {
    id: 'projectDetail.filterAllSubtasks',
    defaultMessage: 'All subactivities',
    description: 'Filter option that disables the subactivity filter',
  },
  filterCategoryLabel: {
    id: 'projectDetail.filterCategoryLabel',
    defaultMessage: 'Category',
    description: 'Filter label: category',
  },
  filterAllCategories: {
    id: 'projectDetail.filterAllCategories',
    defaultMessage: 'All',
    description: 'Filter option that disables the category filter',
  },
})
