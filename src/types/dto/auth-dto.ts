/** GET /v1/auth/me — response */
export interface UserResponseDTO {
  user_id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  is_active: boolean
  plan_id: number | null
  role_id: number
  organization_id: string | null
}

/** POST /v1/auth/access-token — response */
export interface AccessTokenResponseDTO {
  token_type: string
  access_token: string
  expires_at: number
  refresh_token: string
  refresh_token_expires_at: number
}

/** POST /v1/auth/register — request. Role is assigned server-side (SEC-1). */
export interface UserCreateRequestDTO {
  email: string
  password: string
  first_name: string
  last_name: string
}

/** POST /v1/auth/reset-password — request */
export interface UserUpdatePasswordRequestDTO {
  password: string
}
