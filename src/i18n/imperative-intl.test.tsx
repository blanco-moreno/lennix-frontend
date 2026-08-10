import { render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import { makeStore } from '@/stores'
import { ThemeProvider } from '@/theme/provider'

import esMessages from '../../lang/es.json'

import { AppIntlProvider } from './components/intl-provider'
import { apiErrorMessages } from './hooks/use-format-api-error'
import { setImperativeIntl, translate } from './imperative-intl'

const ENGLISH_DEFAULT = 'You do not have permission to perform this action.'

function renderSpanishApp() {
  const store = makeStore({ locale: { locale: 'es' } })
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <AppIntlProvider>
          <span />
        </AppIntlProvider>
      </ThemeProvider>
    </Provider>,
  )
}

describe('imperative intl bridge', () => {
  afterEach(() => setImperativeIntl(null))

  it('falls back to the English defaultMessage before a provider mounts', () => {
    expect(translate(apiErrorMessages.forbidden)).toBe(ENGLISH_DEFAULT)
  })

  it('translates the 403 fallback once the provider publishes its intl', async () => {
    renderSpanishApp()

    await waitFor(() => {
      expect(translate(apiErrorMessages.forbidden)).toBe(
        esMessages['apiError.forbidden'],
      )
    })
  })

  it('stops translating when the provider unmounts', async () => {
    const { unmount } = renderSpanishApp()
    await waitFor(() => {
      expect(translate(apiErrorMessages.forbidden)).not.toBe(ENGLISH_DEFAULT)
    })

    unmount()
    expect(translate(apiErrorMessages.forbidden)).toBe(ENGLISH_DEFAULT)
  })
})
