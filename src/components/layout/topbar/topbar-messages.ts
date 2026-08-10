import { defineMessages } from 'react-intl'

export const topbarMessages = defineMessages({
  breadcrumbLabel: {
    id: 'topbar.breadcrumbLabel',
    defaultMessage: 'You are here',
    description: 'Accessible name of the global breadcrumb landmark',
  },
  tasks: {
    id: 'topbar.tasks',
    defaultMessage: 'Activities',
    description:
      'Breadcrumb segment between the project and the activity page it holds',
  },
  assistedMapping: {
    id: 'topbar.assistedMapping',
    defaultMessage: 'Assisted mapping',
    description: 'Breadcrumb leaf of the diverted-import mapping page',
  },
  toDarkMode: {
    id: 'topbar.toDarkMode',
    defaultMessage: 'Switch to dark mode',
    description: 'Color-mode toggle while the app is light',
  },
  toLightMode: {
    id: 'topbar.toLightMode',
    defaultMessage: 'Switch to light mode',
    description: 'Color-mode toggle while the app is dark',
  },
  hideSidebar: {
    id: 'topbar.hideSidebar',
    defaultMessage: 'Hide menu',
    description: 'Collapses the sidebar to give the page the full width',
  },
  showSidebar: {
    id: 'topbar.showSidebar',
    defaultMessage: 'Show menu',
    description: 'Expands the collapsed sidebar',
  },
  userMenu: {
    id: 'topbar.userMenu',
    defaultMessage: 'Account menu, {name}',
    description: 'Accessible name of the avatar that opens the account menu',
  },
  settings: {
    id: 'topbar.settings',
    defaultMessage: 'Settings',
    description: 'Account menu entry: the settings page',
  },
  logout: {
    id: 'topbar.logout',
    defaultMessage: 'Log out',
    description: 'Account menu entry: end the session',
  },
  draftReview: {
    id: 'topbar.draftReview',
    defaultMessage: 'Review',
    description:
      'Breadcrumb leaf of the draft review canvas while the name loads',
  },
})
