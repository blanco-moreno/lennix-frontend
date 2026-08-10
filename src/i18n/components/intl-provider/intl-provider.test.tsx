import { act, render, screen, waitFor } from '@testing-library/react'
import { useIntl } from 'react-intl'
import { Provider } from 'react-redux'

import { makeStore } from '@/stores'
import { setLocale } from '@/stores/slices/locale-slice'
import { ThemeProvider } from '@/theme/provider'

import enMessages from '../../../../lang/en.json'
import esMessages from '../../../../lang/es.json'
import { apiErrorMessages } from '../../hooks/use-format-api-error'

import { AppIntlProvider } from './intl-provider'

/** Formats a real catalog message so we can see which bundle is active. */
function LocaleProbe() {
  const intl = useIntl()
  return <span>{intl.formatMessage(apiErrorMessages.forbidden)}</span>
}

function renderApp(store: ReturnType<typeof makeStore>) {
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <AppIntlProvider>
          <LocaleProbe />
        </AppIntlProvider>
      </ThemeProvider>
    </Provider>,
  )
}

describe('AppIntlProvider', () => {
  it('shows the loading screen until the first bundle resolves, then the localized tree', async () => {
    const store = makeStore({ locale: { locale: 'es' } })
    renderApp(store)

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()

    expect(
      await screen.findByText(esMessages['apiError.forbidden']),
    ).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('keeps rendering the previous locale during a switch instead of blanking, then re-renders translated', async () => {
    const store = makeStore({ locale: { locale: 'es' } })
    renderApp(store)
    await screen.findByText(esMessages['apiError.forbidden'])

    act(() => {
      store.dispatch(setLocale('en'))
    })

    // The en bundle is still loading: the es tree must stay up, no LoadingScreen.
    expect(
      screen.getByText(esMessages['apiError.forbidden']),
    ).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByText(enMessages['apiError.forbidden']),
      ).toBeInTheDocument()
    })
  })
})
