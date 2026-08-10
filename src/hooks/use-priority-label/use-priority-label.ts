import { useIntl } from 'react-intl'

import { priorityKey, priorityMessages } from '@/utils'

/**
 * Translate a backend priority string (`high`, `medium`, ...) into a
 * user-facing label in the active locale. Mirrors useStatusLabel.
 */
export function usePriorityLabel(): (priority: string) => string {
  const intl = useIntl()
  return (priority) =>
    intl.formatMessage(priorityMessages[priorityKey(priority)])
}
