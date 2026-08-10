import { defineMessages } from 'react-intl'

/** Copy for the per-route error boundary (see `route-error-boundary.tsx`). */
export const routeErrorMessages = defineMessages({
  title: {
    id: 'routeError.title',
    defaultMessage: 'This section could not be loaded',
    description: 'Route error boundary: heading',
  },
  description: {
    id: 'routeError.description',
    defaultMessage:
      'Something went wrong while rendering this page. The rest of the app is still working — you can retry or go back to your projects.',
    description: 'Route error boundary: explanatory body copy',
  },
  retry: {
    id: 'routeError.retry',
    defaultMessage: 'Try again',
    description: 'Route error boundary: reload the failed route',
  },
  backToProjects: {
    id: 'routeError.backToProjects',
    defaultMessage: 'Back to projects',
    description: 'Route error boundary: escape hatch to a known-good route',
  },
})
