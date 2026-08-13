import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Metric } from 'web-vitals'

import { initRum } from './rum'

type VitalCallback = (metric: Pick<Metric, 'name' | 'value'>) => void

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

function goHidden(): void {
  Object.defineProperty(document, 'visibilityState', {
    value: 'hidden',
    configurable: true,
  })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('initRum', () => {
  const sendBeacon = vi.fn(() => true)

  beforeEach(() => {
    vitalCallbacks.length = 0
    sendBeacon.mockClear()
    navigator.sendBeacon = sendBeacon
    initRum()
  })

  it('registers all five vitals and beacons them when the page hides', () => {
    expect(vitalCallbacks).toHaveLength(5)
    vitalCallbacks[0]({ name: 'CLS', value: 0.02 })
    expect(sendBeacon).not.toHaveBeenCalled()

    goHidden()

    expect(sendBeacon).toHaveBeenCalledTimes(1)
    const [url, body] = sendBeacon.mock.calls[0] as unknown as [string, string]
    expect(url).toContain('/v1/rum/vitals')
    expect(JSON.parse(body)).toEqual([
      { type: 'vital', name: 'CLS', value: 0.02, path: '/' },
    ])
  })

  it('beacons uncaught errors and sends nothing when the queue is empty', () => {
    window.dispatchEvent(new ErrorEvent('error', { message: 'kaboom' }))
    goHidden()

    const [, body] = sendBeacon.mock.calls.at(-1) as unknown as [string, string]
    expect(JSON.parse(body)).toContainEqual({
      type: 'error',
      message: 'kaboom',
      path: '/',
    })

    sendBeacon.mockClear()
    goHidden()
    expect(sendBeacon).not.toHaveBeenCalled()
  })
})
