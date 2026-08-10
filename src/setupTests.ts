import '@testing-library/jest-dom/vitest'

import { server } from './mocks/server'

/**
 * jsdom ships no `ResizeObserver`, and every Chakra surface positioned by
 * floating-ui (menus, popovers, tooltips) reaches for it on open — as an
 * unhandled rejection inside a rAF, which surfaces as a test-run error rather
 * than a failed assertion. A no-op is enough: nothing here asserts on layout.
 */
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

/**
 * jsdom ships no `matchMedia` either, and `next-themes` reads it to resolve
 * the OS colour-scheme preference. A light-mode stub keeps every existing
 * assertion on light-mode values truthful.
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => server.resetHandlers())

afterAll(() => {
  server.close()
})
