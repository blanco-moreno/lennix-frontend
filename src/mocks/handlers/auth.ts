import { http, HttpResponse } from 'msw'

import { seedAccessTokenDTO, seedUserDTO } from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'

import { mockActorId } from '../actor'

/** Whoever is acting — Carlos unless a suite planted somebody else. */
export const authMeHandler = http.get('*/v1/auth/me', () => {
  return HttpResponse.json(seedUserDTO(mockActorId()))
})

export const loginHandler = http.post('*/v1/auth/access-token', () => {
  return HttpResponse.json(seedAccessTokenDTO())
})

export const refreshHandler = http.post('*/v1/auth/refresh-token', () => {
  return HttpResponse.json(
    seedAccessTokenDTO({
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDAwMDAwMC0wMDAwLTAwMDEtMDAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJteS1hcHAiLCJleHAiOjE3MTEyMDQ1MDB9.mock-signature',
      expires_at: 1711204500,
      refresh_token: 'bmV3X3JlZnJlc2hfdG9rZW5fYWZ0ZXJfcm90YXRpb24',
      refresh_token_expires_at: 1713623700,
    }),
  )
})

/**
 * A brand-new account: no organization and no plan yet (SEC-1 assigns the role
 * server-side). Pedro is the seed's least-privileged user, so his role is the
 * honest default for a fresh registration.
 */
export const registerHandler = http.post('*/v1/auth/register', () => {
  return HttpResponse.json(
    {
      ...seedUserDTO(SEED_IDS.USER_PEDRO_ID),
      plan_id: null,
      organization_id: null,
    },
    { status: 201 },
  )
})

export const resetPasswordHandler = http.post(
  '*/v1/auth/reset-password',
  () => {
    return new HttpResponse(null, { status: 204 })
  },
)

export const deleteMeHandler = http.delete('*/v1/auth/me', () => {
  return new HttpResponse(null, { status: 204 })
})

export const authHandlers = [
  authMeHandler,
  loginHandler,
  refreshHandler,
  registerHandler,
  resetPasswordHandler,
  deleteMeHandler,
]
