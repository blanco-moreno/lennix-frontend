import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Metric } from 'web-vitals'

type VitalCallback = (metric: Pick<Metric, 'name' | 'value' | 'rating'>) => void

/** Captures each vitals registration so tests can fire metrics on demand. */
const vitalCallbacks: VitalCallback[] = []
const captureCallback = (callback: VitalCallback): void => {
  vitalCallbacks.push(callback)
}

vi.mock('web-vitals', () => ({
  onCLS: (callback: VitalCallback) => captureCallback(callback),
  onFCP: (callback: VitalCallback) => captureCallback(callback),
  onINP: (callback: VitalCallback) => captureCallback(callback),
  onLCP: (callback: VitalCallback) => captureCallback(callback),
  onTTFB: (callback: VitalCallback) => captureCallback(callback),
}))

/**
 * The module reads its endpoint at load, so each case imports it fresh with
 * the environment under test; `undefined` leaves the variable unset.
 */
async function loadRum(endpoint?: string) {
  vi.resetModules()
  if (endpoint !== undefined) vi.stubEnv('VITE_RUM_ENDPOINT', endpoint)
  return import('./rum')
}

/**
 * Every listener a case registers is removed after it, so a fresh module
 * instance never shares the window with the previous case's queue.
 */
const registered: Array<
  [EventTarget, string, EventListenerOrEventListenerObject | null]
> = []
function trackListeners(target: EventTarget): void {
  const original = target.addEventListener.bind(target)
  vi.spyOn(target, 'addEventListener').mockImplementation(
    (type, listener, options) => {
      registered.push([target, type, listener])
      original(type, listener, options)
    },
  )
}

function goHidden(): void {
  Object.defineProperty(document, 'visibilityState', {
    value: 'hidden',
    configurable: true,
  })
  document.dispatchEvent(new Event('visibilitychange'))
}

function lastBody(beacon: ReturnType<typeof vi.fn>): unknown[] {
  const [, body] = beacon.mock.calls.at(-1) as unknown as [string, string]
  return JSON.parse(body) as unknown[]
}

describe('initRum', () => {
  const sendBeacon = vi.fn(() => true)

  beforeEach(() => {
    vitalCallbacks.length = 0
    sendBeacon.mockReset().mockReturnValue(true)
    navigator.sendBeacon = sendBeacon
    trackListeners(window)
    trackListeners(document)
  })

  afterEach(() => {
    for (const [target, type, listener] of registered.splice(0)) {
      target.removeEventListener(type, listener)
    }
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('registers nothing and sends nothing when the endpoint is empty', async () => {
    const { initRum } = await loadRum('')

    initRum()
    window.dispatchEvent(new ErrorEvent('error', { message: 'kaboom' }))
    goHidden()

    expect(vitalCallbacks).toHaveLength(0)
    expect(registered).toHaveLength(0)
    expect(sendBeacon).not.toHaveBeenCalled()
  })

  it('beacons the five vitals with their rating to the backend by default', async () => {
    const { initRum } = await loadRum()

    initRum()
    expect(vitalCallbacks).toHaveLength(5)
    vitalCallbacks[0]({ name: 'CLS', value: 0.02, rating: 'good' })
    expect(sendBeacon).not.toHaveBeenCalled()

    goHidden()

    expect(sendBeacon).toHaveBeenCalledTimes(1)
    const [url] = sendBeacon.mock.calls[0] as unknown as [string, string]
    expect(url).toContain('/v1/rum/vitals')
    expect(lastBody(sendBeacon)).toEqual([
      { type: 'vital', name: 'CLS', value: 0.02, rating: 'good', path: '/' },
    ])
  })

  it('beacons to the configured endpoint instead', async () => {
    const { initRum } = await loadRum('https://rum.example.com/ingest')

    initRum()
    vitalCallbacks[0]({ name: 'LCP', value: 1200, rating: 'needs-improvement' })
    goHidden()

    const [url] = sendBeacon.mock.calls[0] as unknown as [string, string]
    expect(url).toBe('https://rum.example.com/ingest')
  })

  it('beacons uncaught errors with their class and listener kind', async () => {
    const { initRum } = await loadRum()

    initRum()
    window.dispatchEvent(
      new ErrorEvent('error', {
        message: 'boom',
        error: new TypeError('boom'),
      }),
    )
    const rejection = new Event('unhandledrejection') as Event & {
      reason: unknown
    }
    rejection.reason = new RangeError('too far')
    window.dispatchEvent(rejection)
    goHidden()

    expect(lastBody(sendBeacon)).toEqual([
      {
        type: 'error',
        kind: 'error',
        name: 'TypeError',
        message: 'boom',
        path: '/',
      },
      {
        type: 'error',
        kind: 'unhandledrejection',
        name: 'RangeError',
        message: 'RangeError: too far',
        path: '/',
      },
    ])

    sendBeacon.mockClear()
    goHidden()
    expect(sendBeacon).not.toHaveBeenCalled()
  })

  it('never surfaces a failing beacon as a page error', async () => {
    const { initRum } = await loadRum()
    const onError = vi.fn()

    initRum()
    window.dispatchEvent(new ErrorEvent('error', { message: 'kaboom' }))
    window.addEventListener('error', onError)
    sendBeacon.mockImplementation(() => {
      throw new Error('network down')
    })

    expect(goHidden).not.toThrow()
    expect(onError).not.toHaveBeenCalled()
  })
})
