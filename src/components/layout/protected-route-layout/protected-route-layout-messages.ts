import { defineMessages } from 'react-intl'

/**
 * Sidebar navigation labels. Keyed by the same `id` used in the
 * NavigationItem array so the layout can `intl.formatMessage` per item
 * without threading descriptors through the Sidebar component.
 */
export const navMessages = defineMessages({
  dashboard: {
    id: 'nav.dashboard',
    defaultMessage: 'Dashboard',
    description: 'Sidebar nav label: home dashboard',
  },
  projects: {
    id: 'nav.projects',
    defaultMessage: 'Projects',
    description: 'Sidebar nav label: projects list',
  },
  tasks: {
    id: 'nav.tasks',
    defaultMessage: 'Activities',
    description: 'Sidebar nav label: activities/tasks list',
  },
  approvals: {
    id: 'nav.approvals',
    defaultMessage: 'Approvals',
    description:
      'Sidebar nav label: the one approvals bandeja (budget + force start)',
  },
  trash: {
    id: 'nav.trash',
    defaultMessage: 'Trash',
    description: 'Sidebar nav label: papelera (admin only)',
  },
  team: {
    id: 'nav.team',
    defaultMessage: 'Team',
    description: 'Sidebar nav label: team management',
  },
  settings: {
    id: 'nav.settings',
    defaultMessage: 'Settings',
    description: 'Sidebar nav label: account and organization settings',
  },
  import: {
    id: 'nav.import',
    defaultMessage: 'Import schedule',
    description: 'Sidebar nav label: the schedule import (hero flow) entry',
  },
  drafts: {
    id: 'nav.drafts',
    defaultMessage: 'Drafts',
    description: 'Sidebar nav label: imported schedules pending review',
  },
  groupWorks: {
    id: 'nav.groupWorks',
    defaultMessage: 'Works',
    description:
      'Sidebar group header: what I supervise (dashboard, projects, activities)',
  },
  groupSchedules: {
    id: 'nav.groupSchedules',
    defaultMessage: 'Schedules',
    description: 'Sidebar group header: what I am preparing (import, drafts)',
  },
  groupManagement: {
    id: 'nav.groupManagement',
    defaultMessage: 'Management',
    description:
      'Sidebar group header: what I administer (approvals, team, trash)',
  },
  groupAccount: {
    id: 'nav.groupAccount',
    defaultMessage: 'Account',
    description: 'Sidebar group header: profile and organization settings',
  },
})
