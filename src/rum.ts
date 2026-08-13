import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * RUM beacon: web vitals and uncaught JS errors, batched to ms-bk's
 * anonymous `/v1/rum/vitals` endpoint (observability plan D3).
 *
 * `navigator.sendBeacon` posts `text/plain` — no CORS preflight, survives
 * page unload — so entries queue locally and flush when the page goes
 * hidden (where the vitals library finalizes its values anyway) or when
 * the queue fills.
 */

const RUM_URL = `${import.meta.env.VITE_API_BASE_URL}/v1/rum/vitals`

/** Mirrors the server's cap; a fuller queue flushes early. */
const MAX_QUEUE = 20
const MAX_MESSAGE_LENGTH = 300

type RumEntry =
  | { type: 'vital'; name: Metric['name']; value: number; path: string }
  | { type: 'error'; message: string; path: string }

const queue: RumEntry[] = []

function flush(): void {
  if (queue.length === 0) return
  navigator.sendBeacon(RUM_URL, JSON.stringify(queue.splice(0)))
}

function push(entry: RumEntry): void {
  queue.push(entry)
  if (queue.length >= MAX_QUEUE) flush()
}

export function initRum(): void {
  for (const register of [onCLS, onFCP, onINP, onLCP, onTTFB]) {
    register((metric) => {
      push({
        type: 'vital',
        name: metric.name,
        value: metric.value,
        path: window.location.pathname,
      })
    })
  }
  window.addEventListener('error', (event) => {
    push({
      type: 'error',
      message: String(event.message).slice(0, MAX_MESSAGE_LENGTH),
      path: window.location.pathname,
    })
  })
  window.addEventListener('unhandledrejection', (event) => {
    push({
      type: 'error',
      message: String(event.reason).slice(0, MAX_MESSAGE_LENGTH),
      path: window.location.pathname,
    })
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}
