import type { AccessTokenResponse, User } from '@/types'
import type {
  AccessTokenResponseDTO,
  UserResponseDTO,
} from '@/types/dto/auth-dto'

export function mapUserResponseDTOToUser(dto: UserResponseDTO): User {
  return {
    userId: dto.user_id,
    email: dto.email,
    firstName: dto.first_name,
    lastName: dto.last_name,
    phone: dto.phone,
    isActive: dto.is_active,
    planId: dto.plan_id,
    roleId: dto.role_id,
    organizationId: dto.organization_id,
  }
}

export function mapAccessTokenResponseDTOToAccessTokenResponse(
  dto: AccessTokenResponseDTO,
): AccessTokenResponse {
  return {
    tokenType: dto.token_type,
    accessToken: dto.access_token,
    expiresAt: dto.expires_at,
    refreshToken: dto.refresh_token,
    refreshTokenExpiresAt: dto.refresh_token_expires_at,
  }
}
