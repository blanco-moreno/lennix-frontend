import { defineMessages } from 'react-intl'

export const comboboxMessages = defineMessages({
  noOptions: {
    id: 'combobox.noOptions',
    defaultMessage: 'No results found',
    description: 'Shown in the combobox menu when no option matches the search',
  },
  loading: {
    id: 'combobox.loading',
    defaultMessage: 'Searching…',
    description:
      'Shown in the combobox menu while a server-side search is in flight',
  },
})
