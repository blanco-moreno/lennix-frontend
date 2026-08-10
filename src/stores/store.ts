import {
  combineSlices,
  configureStore,
  createListenerMiddleware,
} from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { api } from '@/services'

import { authSlice, clearAuth } from './slices/auth-slice'
import { localeSlice } from './slices/locale-slice'

// The filtered lists' state is not here: `/projects` and `/tasks` keep their
// filters, sort and page in the URL, so a listing can be pasted into a message
// and survive a reload. A slice beside that URL would be a second truth.
const rootReducer = combineSlices(api, authSlice, localeSlice)

export type RootState = ReturnType<typeof rootReducer>

/**
 * Signing out drops the RTK Query cache, not just the slice and the tokens.
 *
 * `useAuth` resolves the current user as `meData ?? storedUser`, and `meData`
 * is the cache entry for `useGetMeQuery` — without this drop the cache outlives
 * `clearAuth`, `user` stays truthy, and `AuthGuard` keeps the user inside the
 * private app.
 */
const signOutListener = createListenerMiddleware()
signOutListener.startListening({
  actionCreator: clearAuth,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(api.util.resetApiState())
  },
})

// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(signOutListener.middleware)
        .concat(api.middleware),
    devTools: process.env.NODE_ENV !== 'production',
    preloadedState,
  })
  // configure listeners using the provided defaults
  // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
  setupListeners(store.dispatch)
  return store
}

export const store = makeStore()

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore['dispatch']
