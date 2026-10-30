/** Pure row formatting for the budget half of the approvals bandeja. */

import type { ProjectCurrency } from '@/types'
import { formatMoney, subtractMoney, toProjectCurrency } from '@/utils'

/** The snapshot is a loose record; the name is best-effort, never a crash. */
export function snapshotName(snapshot: Record<string, unknown>): string {
  const name = snapshot.name
  return typeof name === 'string' && name.length > 0 ? name : '—'
}

/**
 * The currency the request's amounts were typed in, recorded by the snapshot
 * (`BUD-10`); a request older than the field was made in USD.
 */
export function snapshotCurrency(
  snapshot: Record<string, unknown>,
): ProjectCurrency {
  return toProjectCurrency(snapshot.currency)
}

export function formatAmount(
  value: string | null,
  fallback: string,
  currency?: ProjectCurrency,
): string {
  if (value === null) return fallback
  return formatMoney(value, currency)
}

/** Signed difference between requested and previous; empty on a first budget. */
export function deltaLabel(
  previous: string | null,
  requested: string,
  currency?: ProjectCurrency,
): string {
  if (previous === null) return ''
  const delta = subtractMoney(requested, previous)
  const sign = delta > 0 ? '+' : ''
  return `${sign}${formatMoney(delta, currency)}`
}
