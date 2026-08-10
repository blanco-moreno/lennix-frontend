import { defineMessages } from 'react-intl'

export const paginationMessages = defineMessages({
  showingRange: {
    id: 'pagination.showingRange',
    defaultMessage: 'Showing {first, number}–{last, number} of {total, number}',
    description: 'Summary of the visible row range and total count',
  },
  pageOfTotal: {
    id: 'pagination.pageOfTotal',
    defaultMessage: '{page, number} / {totalPages, number}',
    description: 'Current page indicator between the pager buttons',
  },
  perPage: {
    id: 'pagination.perPage',
    defaultMessage: 'Per page:',
    description: 'Label for the page-size selector',
  },
  previousPage: {
    id: 'pagination.previousPage',
    defaultMessage: 'Previous page',
    description: 'Accessible label for the previous-page button',
  },
  nextPage: {
    id: 'pagination.nextPage',
    defaultMessage: 'Next page',
    description: 'Accessible label for the next-page button',
  },
})
