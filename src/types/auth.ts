/** Domain type for the authenticated user */
export interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  isActive: boolean
  planId: number | null
  roleId: number
  organizationId: string | null
}

/** Token pair returned after login or refresh */
export interface AccessTokenResponse {
  tokenType: string
  accessToken: string
  expiresAt: number
  refreshToken: string
  refreshTokenExpiresAt: number
}
