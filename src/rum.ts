import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * RUM beacon: web vitals and uncaught JS errors, batched to ms-bk's
 * anonymous `/v1/rum/vitals` endpoint.
 *
 * `navigator.sendBeacon` posts `text/plain` — no CORS preflight, survives
 * page unload — so entries queue locally and flush when the page goes
 * hidden (where the vitals library finalizes its values anyway) or when
 * the queue fills.
 *
 * `VITE_RUM_ENDPOINT` unset means the backend's endpoint; empty means RUM
 * is off and `initRum` registers no listener at all. A failure to report is
 * swallowed: observability is never the reason a page misbehaves.
 */

const RUM_URL =
  import.meta.env.VITE_RUM_ENDPOINT ??
  `${import.meta.env.VITE_API_BASE_URL}/v1/rum/vitals`

/** Mirrors the server's cap; a fuller queue flushes early. */
const MAX_QUEUE = 20
const MAX_MESSAGE_LENGTH = 300

type ErrorKind = 'error' | 'unhandledrejection'

type RumEntry =
  | {
      type: 'vital'
      name: Metric['name']
      value: number
      rating: Metric['rating']
      path: string
    }
  | {
      type: 'error'
      kind: ErrorKind
      name: string
      message: string
      path: string
    }

const queue: RumEntry[] = []

function flush(): void {
  if (queue.length === 0) return
  try {
    navigator.sendBeacon?.(RUM_URL, JSON.stringify(queue.splice(0)))
  } catch {
    // Reporting is best-effort by design.
  }
}

function push(entry: RumEntry): void {
  queue.push(entry)
  if (queue.length >= MAX_QUEUE) flush()
}

/**
 * The error's class, which is what the metric groups by; the message embeds
 * ids and quoted input, so it is carried for reading but never labels a series.
 */
function errorName(cause: unknown): string {
  if (cause instanceof Error) return cause.name
  return typeof cause === 'object' && cause !== null
    ? cause.constructor.name
    : typeof cause
}

function pushError(kind: ErrorKind, cause: unknown, message: string): void {
  push({
    type: 'error',
    kind,
    name: errorName(cause),
    message: message.slice(0, MAX_MESSAGE_LENGTH),
    path: window.location.pathname,
  })
}

export function initRum(): void {
  if (!RUM_URL) return
  for (const register of [onCLS, onFCP, onINP, onLCP, onTTFB]) {
    register((metric) => {
      push({
        type: 'vital',
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        path: window.location.pathname,
      })
    })
  }
  window.addEventListener('error', (event) => {
    pushError('error', event.error, String(event.message))
  })
  window.addEventListener('unhandledrejection', (event) => {
    pushError('unhandledrejection', event.reason, String(event.reason))
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}
