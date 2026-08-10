import { defineMessages } from 'react-intl'

/**
 * Maps backend error codes (carried in `err.data.code`) to translated
 * user-facing strings. The catalog grows as we surface more error
 * codes; everything unmapped falls back to `unknown`.
 */
export const apiErrorMessages = defineMessages({
  unknown: {
    id: 'apiError.unknown',
    defaultMessage: 'Something went wrong. Please try again.',
    description: 'Generic API error shown when no specific code matches',
  },
  network: {
    id: 'apiError.network',
    defaultMessage: 'Could not reach the server. Check your connection.',
    description: 'API error shown when the request never reaches the backend',
  },
  unauthorized: {
    id: 'apiError.unauthorized',
    defaultMessage: 'Your session has expired. Please sign in again.',
    description:
      'API error shown for 401 responses after the refresh-token retry fails',
  },
  forbidden: {
    id: 'apiError.forbidden',
    defaultMessage: 'You do not have permission to perform this action.',
    description: 'API error shown for 403 responses',
  },
  notFound: {
    id: 'apiError.notFound',
    defaultMessage: 'The requested resource was not found.',
    description: 'API error shown for 404 responses',
  },
  validation: {
    id: 'apiError.validation',
    defaultMessage: 'Some fields are invalid. Please review them.',
    description: 'API error shown for 4xx validation responses',
  },
  tooManyRequests: {
    id: 'apiError.tooManyRequests',
    defaultMessage: 'Too many requests right now. Try again in a moment.',
    description:
      'API error shown for 429 responses, including a rate-limited token refresh',
  },
})
