import { defineMessages } from 'react-intl'

export const notFoundMessages = defineMessages({
  title: {
    id: 'notFound.title',
    defaultMessage: 'Page not found',
    description: 'Title of the 404 page',
  },
  description: {
    id: 'notFound.description',
    defaultMessage:
      'The page you are looking for does not exist or has been moved.',
    description: 'Explanation shown on the 404 page',
  },
  goHome: {
    id: 'notFound.goHome',
    defaultMessage: 'Back to home',
    description: 'Button on the 404 page that navigates to the dashboard',
  },
})
