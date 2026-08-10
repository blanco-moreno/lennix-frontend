/** Pure row formatting for the budget half of the approvals bandeja. */

import { formatMoney, subtractMoney } from '@/utils'

/** The snapshot is a loose record; the name is best-effort, never a crash. */
export function snapshotName(snapshot: Record<string, unknown>): string {
  const name = snapshot.name
  return typeof name === 'string' && name.length > 0 ? name : '—'
}

export function formatAmount(value: string | null, fallback: string): string {
  if (value === null) return fallback
  return formatMoney(value)
}

/** Signed difference between requested and previous; empty on a first budget. */
export function deltaLabel(previous: string | null, requested: string): string {
  if (previous === null) return ''
  const delta = subtractMoney(requested, previous)
  const sign = delta > 0 ? '+' : ''
  return `${sign}${formatMoney(delta)}`
}
