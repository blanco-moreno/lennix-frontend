import { differenceInCalendarDays, format, isValid } from 'date-fns'

export const DEFAULT_CURRENCY = 'USD'
export const DEFAULT_LOCALE = 'en-US'

// 12.34 -> 1234
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

// 1234 -> 12.34
export function fromCents(cents: number): number {
  return cents / 100
}

// '12.34' -> 12.34 | null | '' | 'abc' -> 0
export function parseMoney(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

// (0.1, 0.2, '0.7') -> 1
// (0.3, 0.1) -> 0.2
export function subtractMoney(a: number | string, b: number | string): number {
  return fromCents(toCents(parseMoney(a)) - toCents(parseMoney(b)))
}

// 1234.56 -> '$1,234.56'
export function formatMoney(
  value: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
  }).format(parseMoney(value))
}

// 900 -> '900.00'
export function serializeMoneyForApi(value: number | string): string {
  return fromCents(toCents(parseMoney(value))).toFixed(2)
}

// () -> '$'
export function currencySymbol(
  locale: string = DEFAULT_LOCALE,
  currency: string = DEFAULT_CURRENCY,
): string {
  return (
    new Intl.NumberFormat(locale, { style: 'currency', currency })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? currency
  )
}

const TZ_OFFSET_RE = /([zZ])|([+-]\d{2}:?\d{2})$/

// '2026-07-18T12:00:00' (naive) -> Date at UTC
export function parseDateTime(value: string): Date {
  const trimmed = value.trim()
  return new Date(TZ_OFFSET_RE.test(trimmed) ? trimmed : `${trimmed}Z`)
}

// '2026-07-18' -> Date at local midnight
export function parseDay(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

// '2026-07-18T12:00:00Z' | '2026-07-18' -> Date · null when unreadable
export function parseDateValue(value: string | Date): Date | null {
  const date =
    typeof value === 'string'
      ? value.includes('T')
        ? parseDateTime(value)
        : parseDay(value)
      : value
  return isValid(date) ? date : null
}

// '2026-07-18T12:00:00Z' -> '2026-07-18'
// The internal shape: state, grouping keys, sort criteria, query params and
// request bodies stay ISO 8601. Anything a person reads goes through
// `useFormatDate`, which writes the day in their own language.
export function toISODay(value: string | Date): string {
  const date = parseDateValue(value)
  if (!date) return typeof value === 'string' ? value : ''
  return format(date, 'yyyy-MM-dd')
}

// ('2026-09-15') -> 45 · negative once the day has passed, 0 on the day itself.
// Calendar days, not elapsed hours: "tomorrow" must read as 1 all day long.
export function daysUntil(value: string, from: Date = new Date()): number {
  return differenceInCalendarDays(parseDay(value), from)
}

// (66.667) -> '66.7%'
export function formatPercent(value: number, digits: number = 1): string {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(digits)}%`
}

// 150 -> 100 | -5 -> 0
export function clampPercentage(value: number): number {
  return Math.min(Math.max(value, 0), 100)
}
