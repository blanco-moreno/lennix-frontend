import { defineMessages } from 'react-intl'

export const portfolioHealthMessages = defineMessages({
  title: {
    id: 'portfolioHealth.title',
    defaultMessage: 'Needs your attention',
    description:
      'Heading of the dashboard section listing projects that are slipping',
  },
  subtitle: {
    id: 'portfolioHealth.subtitle',
    defaultMessage: 'Projects that are slipping, worst first',
    description: 'Explains what the portfolio-health list contains',
  },
  viewAllProjects: {
    id: 'portfolioHealth.viewAllProjects',
    defaultMessage: 'All projects',
    description:
      'Link from the portfolio-health section to the single project list',
  },
  slip: {
    id: 'portfolioHealth.slip',
    defaultMessage:
      '{days, plural, one {# day of critical-path slip} other {# days of critical-path slip}}',
    description: 'Per-project critical-path slip shown in the health list',
  },
  atRisk: {
    id: 'portfolioHealth.atRisk',
    defaultMessage:
      '{count, plural, one {# activity at risk} other {# activities at risk}}',
    description: 'Per-project at-risk activity count shown in the health list',
  },
  healthyTitle: {
    id: 'portfolioHealth.healthyTitle',
    defaultMessage: 'Nothing is slipping',
    description: 'Empty state of the portfolio-health list',
  },
  healthyDescription: {
    id: 'portfolioHealth.healthyDescription',
    defaultMessage:
      'No project is delayed or past its target date. Open the project list when you want the full picture.',
    description: 'Empty-state body of the portfolio-health list',
  },
  error: {
    id: 'portfolioHealth.error',
    defaultMessage: 'Could not load portfolio health',
    description: 'Error shown when the project query behind the list fails',
  },
})
