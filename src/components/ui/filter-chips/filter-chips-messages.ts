import { defineMessages } from 'react-intl'

export const filterChipsMessages = defineMessages({
  activeFilters: {
    id: 'filterChips.activeFilters',
    defaultMessage: 'Active filters',
    description:
      'Accessible name of the group holding one removable chip per active filter',
  },
  removeFilter: {
    id: 'filterChips.removeFilter',
    defaultMessage: 'Remove filter: {label}',
    description:
      'Accessible name of a chip that drops one filter — it names which one, so five chips do not read as five identical "close" buttons',
  },
})
