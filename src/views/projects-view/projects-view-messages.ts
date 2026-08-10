import { defineMessages } from 'react-intl'

export const projectsViewMessages = defineMessages({
  // Dashboard header
  title: {
    id: 'projectDashboard.title',
    defaultMessage: 'Project management',
    description: 'Main title of the projects dashboard screen',
  },
  subtitle: {
    id: 'projectDashboard.subtitle',
    defaultMessage: 'Manage all construction projects',
    description: 'Subtitle under the projects dashboard title',
  },
  newProject: {
    id: 'projectDashboard.newProject',
    defaultMessage: 'New project',
    description: 'CTA in the projects dashboard header to create a new project',
  },

  filterSearchPlaceholder: {
    id: 'projectDashboard.filterSearchPlaceholder',
    defaultMessage: 'Search projects…',
    description: 'Placeholder for the search input in the projects filter bar',
  },

  // List
  listError: {
    id: 'projectDashboard.listError',
    defaultMessage: 'Could not load projects',
    description:
      'Error message shown when the projects list query fails (Building2 icon)',
  },
  listEmptyActive: {
    id: 'projectDashboard.listEmptyActive',
    defaultMessage: 'No projects',
    description:
      'Empty state title in the projects tab when the current filter has no matches',
  },
  listEmptyActiveDescription: {
    id: 'projectDashboard.listEmptyActiveDescription',
    defaultMessage: 'No projects match the selected filters.',
    description: 'Empty state body in the projects tab',
  },
  // The query runs on the server now, so "nothing matched" is a statement about
  // every project in the organization and not about the page that happened to
  // be loaded. That makes the two cases worth telling apart: an org with no
  // projects at all is not the same answer as a filter that found none.
  listEmptyNoProjects: {
    id: 'projectDashboard.listEmptyNoProjects',
    defaultMessage: 'No projects yet',
    description:
      'Empty state title when the organization has no live projects at all',
  },
  listEmptyNoProjectsDescription: {
    id: 'projectDashboard.listEmptyNoProjectsDescription',
    defaultMessage: 'Import a schedule to create the first one.',
    description:
      'Empty state body when the organization has no live projects at all',
  },
  listEmptyCta: {
    id: 'projectDashboard.listEmptyCta',
    defaultMessage: 'Upload your first schedule',
    description:
      'First-use call to action: the empty projects list IS the onboarding, and it points at the import wizard',
  },
})
