import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { seedCurrentUserDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS, SEED_ORGANIZATION } from '@/tests/seed'

import { SettingsView } from './settings-view'

/**
 * The gate moved from the route to the section: everyone reaches
 * `/settings`, only an admin sees the organization block.
 */
function renderSettings(roleId: number) {
  const store = makeStore()
  store.dispatch(
    setUser({
      userId: SEED_IDS.USER_CARLOS_ID,
      email: seedCurrentUserDTO().email,
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      phone: null,
      isActive: true,
      planId: null,
      roleId,
      organizationId: SEED_ORGANIZATION.id,
    }),
  )
  return renderWithProviders(<SettingsView />, { store, route: PATHS.SETTINGS })
}

describe('SettingsView', () => {
  it('shows the organization section to an admin', async () => {
    renderSettings(1)

    expect(await screen.findByText(SEED_ORGANIZATION.name)).toBeInTheDocument()
  })

  it('hides the organization section from a field supervisor', async () => {
    renderSettings(5)

    // The account half still renders, so an empty screen cannot pass this.
    expect(
      await screen.findByText(seedCurrentUserDTO().email),
    ).toBeInTheDocument()
    expect(screen.queryByText(SEED_ORGANIZATION.name)).not.toBeInTheDocument()
  })
})
