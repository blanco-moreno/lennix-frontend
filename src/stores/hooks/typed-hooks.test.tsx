/**
 * The pre-typed hooks every feature imports instead of raw react-redux: they
 * must dispatch into and select from the real configured store, so a change to
 * the store shape breaks here instead of in every consumer at once.
 */

import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { localeSlice } from '../slices/locale-slice'
import { makeStore } from '../store'

import { useAppDispatch, useAppSelector } from './typed-hooks'

afterEach(() => {
  localStorage.clear()
})

describe('typed hooks', () => {
  it('dispatch and select round-trip against the configured store', () => {
    const store = makeStore()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(
      () => ({
        dispatch: useAppDispatch(),
        locale: useAppSelector((state) => state.locale.locale),
      }),
      { wrapper },
    )

    // The launch default, straight from RootState.
    expect(result.current.locale).toBe('es')

    act(() => {
      result.current.dispatch(localeSlice.actions.setLocale('en'))
    })

    expect(result.current.locale).toBe('en')
    expect(store.getState().locale.locale).toBe('en')
  })
})
