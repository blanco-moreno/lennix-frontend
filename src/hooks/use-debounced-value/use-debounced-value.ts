import { useEffect, useState } from 'react'

/**
 * App-wide search debounce: 300 ms collapses a typed word into one request and
 * keeps a fast typist inside the per-path rate limits
 * (`lennix-ms-bk/docs/ARCHITECTURE.md` §11).
 */
export const SEARCH_DEBOUNCE_MS = 300

/** `value`, held back until it has stopped changing for `delayMs`. */
export function useDebouncedValue<T>(
  value: T,
  delayMs: number = SEARCH_DEBOUNCE_MS,
): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
