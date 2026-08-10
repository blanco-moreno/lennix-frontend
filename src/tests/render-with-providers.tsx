/**
 * The render helper Phase-6 component tests use.
 *
 * Wraps the tree in the providers every redesigned surface depends on: the
 * Chakra system from `src/theme` (so recipes resolve) and `react-intl` with the
 * English bundle (so a missing key surfaces as a failed assertion, not as a
 * silently rendered default). Pass `store` when the component reads RTK Query
 * or Redux state; omit it for a pure presentational component.
 */

import { ChakraProvider } from '@chakra-ui/react'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'

import type { makeStore } from '@/stores'
import { system } from '@/theme/theme'

import enMessages from '../../lang/en.json'

/**
 * Tests assert English copy, so they pin 'en' explicitly instead of following
 * `DEFAULT_LOCALE` — the launch default is 'es'.
 */
const TEST_LOCALE = 'en'

type Store = ReturnType<typeof makeStore>

export interface RenderWithProvidersOptions extends Omit<
  RenderOptions,
  'wrapper'
> {
  store?: Store
  /**
   * Mount inside a `MemoryRouter` at this entry. Required by anything that
   * navigates or reads route params — which includes every import surface
   * (a draft is addressed by its own id).
   */
  route?: string
  /** Route pattern the component is mounted at, so `useParams` resolves. */
  path?: string
  /** Navigation state the entry arrives with, as `navigate(to, { state })` sends it. */
  state?: unknown
}

/** Exposes the router's current path so a test can assert where it navigated. */
export const LOCATION_TEST_ID = 'test-location'

/**
 * The query string, exposed separately from the path: since the URL owns the
 * project's tab, the schedule's selected row (`?task=`) and the activity's
 * tab, a test asserting navigational state has to be able to read it.
 */
export const SEARCH_TEST_ID = 'test-search'

function LocationProbe() {
  const { pathname, search } = useLocation()
  return (
    <>
      <div data-testid={LOCATION_TEST_ID}>{pathname}</div>
      <div data-testid={SEARCH_TEST_ID}>{search}</div>
    </>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  { store, route, path, state, ...options }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    const entry = route ?? path ?? '/'
    const [pathname, search = ''] = entry.split('?')
    const routed =
      route || path ? (
        <MemoryRouter
          initialEntries={
            state === undefined ? [entry] : [{ pathname, search, state }]
          }
        >
          {path ? (
            <Routes>
              <Route path={path} element={<>{children}</>} />
            </Routes>
          ) : (
            children
          )}
          <LocationProbe />
        </MemoryRouter>
      ) : (
        children
      )

    const tree = (
      <ChakraProvider value={system}>
        <IntlProvider
          locale={TEST_LOCALE}
          defaultLocale={TEST_LOCALE}
          messages={enMessages}
        >
          {routed}
        </IntlProvider>
      </ChakraProvider>
    )
    return store ? <Provider store={store}>{tree}</Provider> : tree
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
