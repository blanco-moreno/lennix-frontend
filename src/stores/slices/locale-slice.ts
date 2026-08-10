import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import {
  DEFAULT_LOCALE,
  persistLocale,
  resolveLocale,
  type SupportedLocale,
} from '@/i18n'

interface LocaleState {
  locale: SupportedLocale
}

// Resolve lazily so SSR/tests with no `window` get the default.
const initialState: LocaleState = {
  locale: typeof window === 'undefined' ? DEFAULT_LOCALE : resolveLocale(),
}

export const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale(state, { payload }: PayloadAction<SupportedLocale>) {
      state.locale = payload
      persistLocale(payload)
    },
  },
  selectors: {
    selectLocale: (state) => state.locale,
  },
})

export const { setLocale } = localeSlice.actions
export const { selectLocale } = localeSlice.selectors
