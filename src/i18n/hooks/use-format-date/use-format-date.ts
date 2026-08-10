import { useCallback } from 'react'
import { useIntl } from 'react-intl'

import { parseDateValue } from '@/utils'

/**
 * The only date formatter a person's eyes reach: the day as the active locale
 * writes it — `18 jul 2026` (es), `Jul 18, 2026` (en), `18 de jul. de 2026`
 * (pt-BR).
 *
 * Display-only on purpose. Everything the app *holds* — form state, grouping
 * keys, sort criteria, query params, request bodies — stays ISO 8601
 * (`YYYY-MM-DD`), which is what `toISODay` is for: a localized string that
 * leaks back into state is a date the backend cannot parse.
 *
 * An unreadable value is returned verbatim rather than swallowed: a date the
 * app failed to understand is still information to whoever is looking at it.
 */
export function useFormatDate() {
  const intl = useIntl()

  return useCallback(
    (value: string | Date, options?: Intl.DateTimeFormatOptions): string => {
      const date = parseDateValue(value)
      if (!date) return typeof value === 'string' ? value : ''
      return intl.formatDate(date, { dateStyle: 'medium', ...options })
    },
    [intl],
  )
}
