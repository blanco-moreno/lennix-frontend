import { defineMessages } from 'react-intl'

export const tasksViewMessages = defineMessages({
  // Header
  title: {
    id: 'taskDashboard.title',
    defaultMessage: 'Activities across projects',
    description: 'Main title of the cross-project activity screen',
  },
  subtitle: {
    id: 'taskDashboard.subtitle',
    defaultMessage:
      'Every activity of every project in one place. To work on one project, open its schedule.',
    description:
      'Subtitle that frames /tasks as the portfolio view of the schedule spine',
  },
  openProjectSchedule: {
    id: 'taskDashboard.openProjectSchedule',
    defaultMessage: 'Open schedule',
    description:
      'Link on each project group that opens that project’s schedule',
  },
  groupTaskCount: {
    id: 'taskDashboard.groupTaskCount',
    defaultMessage: '{count, plural, one {# activity} other {# activities}}',
    description:
      'Counter beside an obra name in the grouped activity list, on this page',
  },
  // Tabs
  tabList: {
    id: 'taskDashboard.tabList',
    defaultMessage: 'All main activities',
    description:
      'Label of the portfolio-wide list tab on /tasks — the default tab',
  },
  tabAssigned: {
    id: 'taskDashboard.tabAssigned',
    defaultMessage: 'Assigned to me',
    description:
      'Label of the tab listing the activities assigned to the logged-in user',
  },

  // Assigned-to-me tab
  assignedEmptyTitle: {
    id: 'taskDashboard.assignedEmptyTitle',
    defaultMessage: 'Nothing assigned to you',
    description: 'Empty state title of the "assigned to me" tab',
  },
  assignedEmptyDescription: {
    id: 'taskDashboard.assignedEmptyDescription',
    defaultMessage:
      'Activities appear here when someone assigns one to you, at either level. Check the filters if you were expecting something.',
    description: 'Empty state description of the "assigned to me" tab',
  },

  // List tab
  listEmptyTitle: {
    id: 'taskDashboard.listEmptyTitle',
    defaultMessage: 'No main activities',
    description: 'Empty state title of the portfolio activity list',
  },
  listEmptyDescription: {
    id: 'taskDashboard.listEmptyDescription',
    defaultMessage:
      'Activities appear here once a schedule is imported. Check the filters if you were expecting something.',
    description: 'Empty state description of the portfolio activity list',
  },

  // Filters
  filterSearchPlaceholder: {
    id: 'taskDashboard.filterSearchPlaceholder',
    defaultMessage: 'Search main activities…',
    description: 'Placeholder for the search input in the task filter bar',
  },

  // Toasts
  // Critical path alert
  criticalPathHeading: {
    id: 'taskDashboard.criticalPathHeading',
    defaultMessage: 'Critical path {code} active',
    description:
      'Heading of a critical-path alert banner; {code} is the path identifier',
  },
  criticalPathDetail: {
    id: 'taskDashboard.criticalPathDetail',
    defaultMessage:
      '{days} days delayed{category, select, none {} other {, category: {category}}}.',
    description:
      'Detail line of a critical-path alert showing delay days and optional category',
  },
  criticalPathAffected: {
    id: 'taskDashboard.criticalPathAffected',
    defaultMessage:
      '{count, plural, one {# affected activity} other {# affected activities}}.',
    description:
      'Footer note of a critical-path alert with the number of affected tasks',
  },
})
