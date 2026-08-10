/**
 * Section smoke: the account half of `/settings` renders the signed-in seed
 * user (`GET /v1/auth/me`). Its title belongs to the page around it.
 */

import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { seedCurrentUserDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { UserProfileView } from './user-profile-view'

describe('UserProfileView', () => {
  it('renders the signed-in user profile on its route', async () => {
    renderWithProviders(<UserProfileView />, {
      store: makeStore(),
      route: PATHS.SETTINGS,
    })

    expect(
      await screen.findByText(seedCurrentUserDTO().email),
    ).toBeInTheDocument()
  })
})
