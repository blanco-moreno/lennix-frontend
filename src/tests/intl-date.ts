import { parseDateValue } from '@/utils/format/format'

/**
 * The date as the UI renders it under the locale `renderWithProviders` pins
 * ('en').
 *
 * Tests assert what a person sees, which is no longer the ISO string — but
 * hard-coding `Jul 18, 2026` would pin the assertion to one ICU version. This
 * mirrors `useFormatDate` instead.
 */
export function displayedDate(value: string | Date): string {
  const date = parseDateValue(value)
  if (!date) return typeof value === 'string' ? value : ''
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}
