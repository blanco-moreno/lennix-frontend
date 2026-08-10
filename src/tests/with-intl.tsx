import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { IntlProvider } from 'react-intl'

import enMessages from '../../lang/en.json'

/**
 * Tests assert English copy, so they pin 'en' explicitly instead of following
 * `DEFAULT_LOCALE` — the launch default is 'es' and must be free to
 * change without rewriting every assertion.
 */
const TEST_LOCALE = 'en'

function IntlWrapper({ children }: { children: ReactNode }) {
  return (
    <IntlProvider
      locale={TEST_LOCALE}
      defaultLocale={TEST_LOCALE}
      messages={enMessages}
    >
      {children}
    </IntlProvider>
  )
}

/**
 * `renderWithIntl(ui)` wraps the rendered component in <IntlProvider>
 * using the English bundle. Compose with `Provider` when the component
 * also depends on Redux.
 */
export function renderWithIntl(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: IntlWrapper, ...options })
}
