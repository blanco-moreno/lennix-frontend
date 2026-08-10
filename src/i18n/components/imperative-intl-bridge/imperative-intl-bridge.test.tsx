import { render } from '@testing-library/react'
import { IntlProvider } from 'react-intl'

import enMessages from '../../../../lang/en.json'
import esMessages from '../../../../lang/es.json'
import { apiErrorMessages } from '../../hooks/use-format-api-error'
import { setImperativeIntl, translate } from '../../imperative-intl'

import { ImperativeIntlBridge } from './imperative-intl-bridge'

function bridgeIn(locale: 'en' | 'es') {
  const messages = locale === 'en' ? enMessages : esMessages
  return (
    <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
      <ImperativeIntlBridge />
    </IntlProvider>
  )
}

describe('ImperativeIntlBridge', () => {
  afterEach(() => setImperativeIntl(null))

  it('publishes the active intl on mount so non-React callers translate', () => {
    render(bridgeIn('es'))

    expect(translate(apiErrorMessages.forbidden)).toBe(
      esMessages['apiError.forbidden'],
    )
  })

  it('re-publishes when the locale changes', () => {
    const { rerender } = render(bridgeIn('es'))
    rerender(bridgeIn('en'))

    expect(translate(apiErrorMessages.forbidden)).toBe(
      enMessages['apiError.forbidden'],
    )
  })

  it('clears the published intl on unmount, falling back to defaultMessage', () => {
    const { unmount } = render(bridgeIn('es'))
    unmount()

    expect(translate(apiErrorMessages.forbidden)).toBe(
      apiErrorMessages.forbidden.defaultMessage,
    )
  })
})
