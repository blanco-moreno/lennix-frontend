import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { LanguageSwitcher } from './language-switcher'

function renderSwitcher(locale: 'en' | 'es' = 'es') {
  const store = makeStore({ locale: { locale } })
  renderWithProviders(<LanguageSwitcher />, { store })
  return store
}

describe('LanguageSwitcher', () => {
  it('shows the current locale on the trigger and lists every supported language', async () => {
    const user = userEvent.setup()
    renderSwitcher('es')

    const trigger = screen.getByRole('button', { name: 'Change language' })
    expect(trigger).toHaveTextContent('es')

    await user.click(trigger)
    expect(
      await screen.findByRole('menuitem', { name: /English/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /Español/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /Português \(Brasil\)/ }),
    ).toBeInTheDocument()
  })

  it('switches the app locale when another language is selected', async () => {
    const user = userEvent.setup()
    const store = renderSwitcher('es')

    await user.click(screen.getByRole('button', { name: 'Change language' }))
    await user.click(await screen.findByRole('menuitem', { name: /English/ }))

    expect(store.getState().locale.locale).toBe('en')
  })

  it('leaves the store untouched when re-selecting the current language', async () => {
    const user = userEvent.setup()
    const store = renderSwitcher('es')
    const before = store.getState().locale

    await user.click(screen.getByRole('button', { name: 'Change language' }))
    await user.click(await screen.findByRole('menuitem', { name: /Español/ }))

    // Same state object: no setLocale action was dispatched.
    expect(store.getState().locale).toBe(before)
  })
})
