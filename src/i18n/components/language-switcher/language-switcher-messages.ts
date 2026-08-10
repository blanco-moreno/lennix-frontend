import { defineMessages } from 'react-intl'

export const languageSwitcherMessages = defineMessages({
  buttonAriaLabel: {
    id: 'languageSwitcher.buttonAriaLabel',
    defaultMessage: 'Change language',
    description:
      'Aria-label for the language switcher button in the topbar/sidebar',
  },
  buttonTooltip: {
    id: 'languageSwitcher.buttonTooltip',
    defaultMessage: 'Language: {label}',
    description:
      'Tooltip on the language switcher showing the current language name',
  },
})
