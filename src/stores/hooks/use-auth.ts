import { useCallback, useEffect } from 'react'

import { useIntlToast } from '@/i18n'
import { useGetMeQuery, useLoginAccessTokenMutation } from '@/services/auth'

import {
  setCredentials,
  setUser,
  clearAuth,
  selectAccessToken,
  selectAuthUser,
} from '../slices/auth-slice'

import { authSessionMessages as m } from './use-auth-messages'

import { useAppDispatch, useAppSelector } from '.'

/**
 * The freshest profile the app has seen: the query first, the slice second.
 * The ordering is load-bearing — the slice is written from an effect, so it
 * trails the query by one commit.
 */
export function useProfileSnapshot() {
  const storedUser = useAppSelector(selectAuthUser)
  const accessToken = useAppSelector(selectAccessToken)
  const { data: meData } = useGetMeQuery(undefined, { skip: !accessToken })
  return meData ?? storedUser
}

/**
 * Who is authenticated — the profile, but only while credentials are held.
 * Resolving through the token keeps a late `/auth/me` answer or a stale slice
 * from holding `AuthGuard` open after sign-out.
 */
export function useResolvedUser() {
  const accessToken = useAppSelector(selectAccessToken)
  const profile = useProfileSnapshot()
  return accessToken ? profile : null
}

/**
 * Read-only auth state hook: the current authenticated user and loading state.
 */
export function useAuth() {
  const dispatch = useAppDispatch()
  const storedUser = useAppSelector(selectAuthUser)
  const accessToken = useAppSelector(selectAccessToken)

  const { data: meData, isLoading } = useGetMeQuery(undefined, {
    skip: !accessToken,
  })

  const user = useResolvedUser()

  // Sync RTK Query data into the Redux slice as a side effect — must
  // run after render, not during it, otherwise React 19 surfaces the
  // "Cannot update a component while rendering a different component"
  // warning whenever AuthGuard reads `useAuth()`.
  // Compare roleId/organizationId too, not just identity: a /me refetch
  // after org creation carries a role elevation for the SAME user,
  // and permission gating reads the slice — a userId-only guard would
  // keep the stale role until a full reload.
  // `accessToken` gates the write for the same reason it gates the read: a
  // `/auth/me` that lands after sign-out would otherwise put the user straight
  // back into the slice, where nothing later clears it.
  useEffect(() => {
    if (
      accessToken &&
      meData &&
      (!storedUser ||
        storedUser.userId !== meData.userId ||
        storedUser.roleId !== meData.roleId ||
        storedUser.organizationId !== meData.organizationId)
    ) {
      dispatch(setUser(meData))
    }
  }, [accessToken, meData, storedUser, dispatch])

  return { user, isLoading }
}

/**
 * Auth actions hook: login and logout handlers.
 */
export function useAuthActions() {
  const dispatch = useAppDispatch()
  const toast = useIntlToast()
  const [loginMutation] = useLoginAccessTokenMutation()

  const handleLogin = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const result = await loginMutation({
        username: email,
        password,
      }).unwrap()

      dispatch(
        setCredentials({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt,
          remember: rememberMe,
        }),
      )

      toast.success(m.loginSuccess)
    },
    [loginMutation, dispatch, toast],
  )

  // `clearAuth` is the whole sign-out: the store's sign-out listener drops the
  // RTK Query cache alongside it, so nothing survives to keep `useAuth`
  // reporting a user. See `stores/store.ts`.
  const handleLogout = useCallback(() => {
    dispatch(clearAuth())
    toast.success(m.logoutSuccess)
  }, [dispatch, toast])

  return { handleLogin, handleLogout }
}
