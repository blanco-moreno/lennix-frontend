import type {
  UserCreateRequestDTO,
  UserUpdatePasswordRequestDTO,
} from '@/types/dto/auth-dto'

export const getMe = () => '/v1/auth/me'

export const loginAccessToken = (body: {
  username: string
  password: string
}) => {
  const formData = new URLSearchParams()
  formData.append('username', body.username)
  formData.append('password', body.password)
  return {
    url: '/v1/auth/access-token',
    method: 'POST',
    body: formData.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }
}

export const refreshToken = (body: { refresh_token: string }) => ({
  url: '/v1/auth/refresh-token',
  method: 'POST',
  body,
})

export const register = (body: UserCreateRequestDTO) => ({
  url: '/v1/auth/register',
  method: 'POST',
  body,
})

export const resetPassword = (body: UserUpdatePasswordRequestDTO) => ({
  url: '/v1/auth/reset-password',
  method: 'POST',
  body,
})

export const deleteMe = () => ({
  url: '/v1/auth/me',
  method: 'DELETE',
})
