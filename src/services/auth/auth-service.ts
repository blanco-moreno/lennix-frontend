import type { User, AccessTokenResponse } from '@/types'
import type {
  UserCreateRequestDTO,
  UserUpdatePasswordRequestDTO,
} from '@/types/dto/auth-dto'

import { api } from '../api-injector'

import {
  getMe,
  loginAccessToken,
  refreshToken,
  register,
  resetPassword,
  deleteMe,
} from './auth-endpoint'
import {
  mapUserResponseDTOToUser,
  mapAccessTokenResponseDTOToAccessTokenResponse,
} from './auth-mapper'

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: getMe,
      transformResponse: mapUserResponseDTOToUser,
      providesTags: ['User'],
    }),
    loginAccessToken: builder.mutation<
      AccessTokenResponse,
      { username: string; password: string }
    >({
      query: loginAccessToken,
      transformResponse: mapAccessTokenResponseDTOToAccessTokenResponse,
      invalidatesTags: ['User'],
    }),
    refreshToken: builder.mutation<
      AccessTokenResponse,
      { refresh_token: string }
    >({
      query: refreshToken,
      transformResponse: mapAccessTokenResponseDTOToAccessTokenResponse,
    }),
    register: builder.mutation<User, UserCreateRequestDTO>({
      query: register,
      transformResponse: mapUserResponseDTOToUser,
    }),
    resetPassword: builder.mutation<void, UserUpdatePasswordRequestDTO>({
      query: resetPassword,
    }),
    deleteMe: builder.mutation<void, void>({
      query: deleteMe,
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useGetMeQuery,
  useLoginAccessTokenMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useDeleteMeMutation,
} = authApi
