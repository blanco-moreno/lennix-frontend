import { seedAccessTokenDTO, seedCurrentUserDTO } from '@/tests/fixtures'
import { SEED_IDS, SEED_ORGANIZATION } from '@/tests/seed'

import {
  mapAccessTokenResponseDTOToAccessTokenResponse,
  mapUserResponseDTOToUser,
} from './auth-mapper'

describe('mapUserResponseDTOToUser', () => {
  it('maps every field of the seeded demo login', () => {
    const dto = seedCurrentUserDTO()

    const user = mapUserResponseDTOToUser(dto)

    expect(user.userId).toBe(SEED_IDS.USER_CARLOS_ID)
    expect(user.email).toBe(dto.email)
    expect(user.firstName).toBe(dto.first_name)
    expect(user.lastName).toBe(dto.last_name)
    expect(user.phone).toBe(dto.phone)
    expect(user.isActive).toBe(dto.is_active)
    expect(user.planId).toBe(SEED_ORGANIZATION.planId)
    expect(user.roleId).toBe(dto.role_id)
    expect(user.organizationId).toBe(SEED_ORGANIZATION.id)
  })

  it('keeps the org-less nullables null (a user before onboarding)', () => {
    const user = mapUserResponseDTOToUser({
      ...seedCurrentUserDTO(),
      plan_id: null,
      organization_id: null,
    })

    expect(user.planId).toBeNull()
    expect(user.organizationId).toBeNull()
  })
})

describe('mapAccessTokenResponseDTOToAccessTokenResponse', () => {
  it('maps the token pair with both expiries', () => {
    const dto = seedAccessTokenDTO()

    const token = mapAccessTokenResponseDTOToAccessTokenResponse(dto)

    expect(token.tokenType).toBe(dto.token_type)
    expect(token.accessToken).toBe(dto.access_token)
    expect(token.expiresAt).toBe(dto.expires_at)
    expect(token.refreshToken).toBe(dto.refresh_token)
    expect(token.refreshTokenExpiresAt).toBe(dto.refresh_token_expires_at)
    // The two expiries must not be swapped: the refresh token outlives access.
    expect(token.refreshTokenExpiresAt).toBeGreaterThan(token.expiresAt)
  })
})
