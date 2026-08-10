import { useIntl } from 'react-intl'

import { statusKey, statusMessages } from '@/utils'

/**
 * Translate a backend status string (`on_track`, `delayed`, ...) into
 * a user-facing label in the active locale.
 */
export function useStatusLabel(): (status: string) => string {
  const intl = useIntl()
  return (status) => intl.formatMessage(statusMessages[statusKey(status)])
}
