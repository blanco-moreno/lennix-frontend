/** `/v1/auth` responses for the seeded demo users. */

import { SEED_IDS, SEED_ORGANIZATION, SEED_USERS } from '@/tests/seed'
import type {
  AccessTokenResponseDTO,
  UserResponseDTO,
} from '@/types/dto/auth-dto'

import { seedUser } from './seed-lookup'

/** Carlos Rodriguez — the org owner and the demo login. */
export const SEED_CURRENT_USER_ID = SEED_IDS.USER_CARLOS_ID

export function seedUserDTO(userId: string): UserResponseDTO {
  const user = seedUser(userId)
  const isMember = SEED_ORGANIZATION.members.some((m) => m.userId === userId)
  return {
    user_id: user.userId,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    phone: null,
    is_active: true,
    plan_id: isMember ? SEED_ORGANIZATION.planId : null,
    role_id: user.roleId,
    organization_id: isMember ? SEED_ORGANIZATION.id : null,
  }
}

/** `GET /v1/auth/me` for the demo login. */
export function seedCurrentUserDTO(): UserResponseDTO {
  return seedUserDTO(SEED_CURRENT_USER_ID)
}

export function seedUserDTOs(): UserResponseDTO[] {
  return SEED_USERS.map((user) => seedUserDTO(user.userId))
}

/**
 * A syntactically valid but unsigned token. Expiries are fixed instants so
 * refresh-flow tests are deterministic.
 */
export function seedAccessTokenDTO(
  overrides?: Partial<AccessTokenResponseDTO>,
): AccessTokenResponseDTO {
  return {
    token_type: 'Bearer',
    access_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMDAwMDAwMC0wMDAwLTAwMDEtMDAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJteS1hcHAiLCJleHAiOjE3MTEyMDAwMDB9.mock-signature',
    expires_at: 1711200000,
    refresh_token: 'dG9rZW5fdXJsc2FmZV9yZWZyZXNoXzEyMzQ1Njc4OTA',
    refresh_token_expires_at: 1713619200,
    ...overrides,
  }
}
