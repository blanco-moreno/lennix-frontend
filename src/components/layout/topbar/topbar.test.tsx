/**
 * What the header owes a phone: one control that opens the navigation, and
 * the preferences folded into the account menu instead of eating the title.
 */

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { User } from '@/types'

import { Topbar } from './topbar'

const user: User = {
  userId: 'u-1',
  email: 'carlos@lennix.test',
  firstName: 'Carlos',
  lastName: 'Ruiz',
  phone: null,
  isActive: true,
  planId: null,
  roleId: 1,
  organizationId: null,
}

function renderTopbar(props: Partial<Parameters<typeof Topbar>[0]> = {}) {
  return renderWithProviders(<Topbar user={user} {...props} />, {
    store: makeStore(),
    route: '/projects',
  })
}

describe('Topbar', () => {
  it('opens the mobile navigation from the header, not from a floating button', async () => {
    const onOpenMobileMenu = vi.fn()
    renderTopbar({ onOpenMobileMenu })

    await userEvent.click(screen.getByTestId('mobile-menu-trigger'))

    expect(onOpenMobileMenu).toHaveBeenCalled()
  })

  it('omits the hamburger when nothing owns the drawer', () => {
    renderTopbar()

    expect(screen.queryByTestId('mobile-menu-trigger')).toBeNull()
  })

  it('keeps language and color mode reachable from the account menu', async () => {
    renderTopbar()

    await userEvent.click(screen.getByTestId('user-menu-trigger'))

    expect(await screen.findByText('Español')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText(/switch to (dark|light) mode/i)).toBeInTheDocument()
  })
})
