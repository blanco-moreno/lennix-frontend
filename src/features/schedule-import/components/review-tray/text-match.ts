/**
 * Name matching for the tray's closed-set widgets.
 *
 * Imported files write the same activity three ways — accents dropped, extra
 * spaces, an item number glued to the front — so "did this row already land?"
 * and "which row does this predecessor mean?" are both name questions, answered
 * here once. Deterministic only: no LLM anywhere on the import path.
 */

/** Combining marks left behind by NFD — what strips the accents. */
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g')

/** Case, accents, punctuation and spacing removed — what two names share. */
export function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function bigrams(value: string): string[] {
  const compact = value.replace(/ /g, '')
  const pairs: string[] = []
  for (let index = 0; index < compact.length - 1; index += 1) {
    pairs.push(compact.slice(index, index + 2))
  }
  return pairs
}

/**
 * Dice coefficient over character bigrams, in [0, 1].
 *
 * Typo-tolerant by construction ("HORMIGON" vs "HORMIGÓN ARMADO" still scores
 * high) and cheap enough to run over every row of a schedule on each keystroke.
 */
export function similarity(left: string, right: string): number {
  const a = normalizeName(left)
  const b = normalizeName(right)
  if (!a || !b) return 0
  if (a === b) return 1

  const aPairs = bigrams(a)
  const bPairs = bigrams(b)
  if (aPairs.length === 0 || bPairs.length === 0) return 0

  const pool = new Map<string, number>()
  for (const pair of bPairs) pool.set(pair, (pool.get(pair) ?? 0) + 1)

  let hits = 0
  for (const pair of aPairs) {
    const remaining = pool.get(pair) ?? 0
    if (remaining > 0) {
      pool.set(pair, remaining - 1)
      hits += 1
    }
  }

  return (2 * hits) / (aPairs.length + bPairs.length)
}
