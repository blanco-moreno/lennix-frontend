/**
 * Generic unknown→typed coercion primitives for pass-through JSON.
 *
 * ms-ai owns the parse-report/ledger/quality shapes and ms-bk passes them
 * through unchanged, so every field is read defensively and normalized ONCE —
 * an unexpected payload degrades to a quiet empty value instead of a crashed
 * canvas.
 */

export type Json = Record<string, unknown>

export function asRecord(value: unknown): Json {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Json)
    : {}
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

/**
 * Read a prose field.
 *
 * Accepts a list of fragments as well as a string: the seed manifest generator
 * splits Python implicit string concatenation into an array, so the same
 * field reaches the app as `"…"` from a live backend and as `["…", "…"]` from a
 * seeded fixture. Joining here keeps both honest instead of rendering `[object].
 */
export function text(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join('')
  return ''
}

export function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function bool(value: unknown): boolean {
  return value === true
}

export function optionalText(value: unknown): string | null {
  const read = text(value)
  return read === '' ? null : read
}

export function stringList(value: unknown): string[] {
  return asArray(value).map(text).filter(Boolean)
}

/**
 * Read a closed-set token, falling back to a stated default.
 *
 * ms-bk refuses a contract carrying a member outside the set (`ContractFactsError`),
 * so the fallback is unreachable through the real seam. It exists because this
 * layer is the app's boundary against *any* JSON — degrading a token to a known
 * value keeps the canvas rendering instead of crashing it, which is the same
 * bargain every other reader here makes.
 */
export function token<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const read = text(value)
  return (allowed as readonly string[]).includes(read) ? (read as T) : fallback
}

export function optionalNum(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}
