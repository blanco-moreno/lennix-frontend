import { useIntl } from 'react-intl'

import { apiErrorMessages } from './api-error-messages'

type ApiErrorCode = keyof typeof apiErrorMessages

/** Formats a backend error code as a translated user-facing string. */
export function useFormatApiError() {
  const intl = useIntl()
  return (code: string | undefined): string => {
    const descriptor =
      code && code in apiErrorMessages
        ? apiErrorMessages[code as ApiErrorCode]
        : apiErrorMessages.unknown
    return intl.formatMessage(descriptor)
  }
}
