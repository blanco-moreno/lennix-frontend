import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { setImperativeIntl } from '../../imperative-intl'

/**
 * Publishes the active `IntlShape` so non-React call sites (the RTK Query
 * interceptor) can translate. Renders nothing.
 */
export function ImperativeIntlBridge() {
  const intl = useIntl()
  useEffect(() => {
    setImperativeIntl(intl)
    return () => setImperativeIntl(null)
  }, [intl])
  return null
}
