/**
 * Pins the locale slice: Spanish is the launch default (Chilean-contractor
 * beachhead), an explicit switch persists to localStorage, and only a
 * supported persisted value may override the default on the next load.
 */

import { localeSlice, selectLocale, setLocale } from './locale-slice'

const STORAGE_KEY = 'lennix.locale'

beforeEach(() => {
  localStorage.clear()
})

describe('initial state', () => {
  it('defaults to Spanish when nothing is persisted', () => {
    expect(localeSlice.getInitialState().locale).toBe('es')
  })

  it('honours a persisted explicit choice over the default', async () => {
    vi.resetModules()
    localStorage.setItem(STORAGE_KEY, 'en')
    const mod = await import('./locale-slice')
    expect(mod.localeSlice.getInitialState().locale).toBe('en')
  })

  it('ignores an unsupported persisted value and falls back to Spanish', async () => {
    vi.resetModules()
    localStorage.setItem(STORAGE_KEY, 'fr')
    const mod = await import('./locale-slice')
    expect(mod.localeSlice.getInitialState().locale).toBe('es')
  })
})

describe('setLocale', () => {
  it.each(['en', 'pt-BR', 'es'] as const)(
    'switches the state to %s and persists the choice',
    (locale) => {
      const next = localeSlice.reducer({ locale: 'es' }, setLocale(locale))
      expect(next.locale).toBe(locale)
      expect(localStorage.getItem(STORAGE_KEY)).toBe(locale)
    },
  )
})

describe('selectLocale', () => {
  it('reads the locale from the locale branch of the root state', () => {
    expect(selectLocale({ locale: { locale: 'pt-BR' } })).toBe('pt-BR')
  })
})
