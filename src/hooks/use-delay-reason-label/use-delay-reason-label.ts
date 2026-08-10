import { useIntl } from 'react-intl'

import { delayReasonKey, delayReasonMessages } from '@/utils'

/**
 * Translate a backend delay reason (`weather_conditions`, ...) into a
 * user-facing label in the active locale. Unrecognised values fall back
 * to a humanised version of the raw string ("some_reason" → "Some reason").
 */
export function useDelayReasonLabel(): (reason: string) => string {
  const intl = useIntl()
  return (reason) => {
    const key = delayReasonKey(reason)
    if (key) return intl.formatMessage(delayReasonMessages[key])
    const humanised = reason.replace(/_/g, ' ')
    return humanised.charAt(0).toUpperCase() + humanised.slice(1)
  }
}
