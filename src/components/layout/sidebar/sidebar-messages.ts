import { defineMessages } from 'react-intl'

export const sidebarMessages = defineMessages({
  logoAlt: {
    id: 'sidebar.logoAlt',
    defaultMessage: 'Lennix — construction control and tracking',
    description: 'Alt text on the Lennix logo image in the sidebar',
  },
  openMobileMenu: {
    id: 'sidebar.openMobileMenu',
    defaultMessage: 'Open mobile menu',
    description:
      'Aria-label for the mobile menu toggle when the menu is closed',
  },
  closeMobileMenu: {
    id: 'sidebar.closeMobileMenu',
    defaultMessage: 'Close mobile menu',
    description: 'Aria-label for the mobile menu backdrop and toggle',
  },
  logout: {
    id: 'sidebar.logout',
    defaultMessage: 'Log out',
    description: 'Logout button label in the sidebar footer',
  },
  roleFallback: {
    id: 'sidebar.roleFallback',
    defaultMessage: '—',
    description: 'Placeholder shown when the user has no role assigned',
  },
  language: {
    id: 'sidebar.language',
    defaultMessage: 'Language',
    description: 'Label for the language switcher card in the sidebar footer',
  },
})
