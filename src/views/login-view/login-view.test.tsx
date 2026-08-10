/**
 * Route smoke: `/login` renders the auth form inside the public layout.
 */

import { screen } from '@testing-library/react'

import { PATHS } from '@/constants'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'

import { LoginView } from './login-view'

describe('LoginView', () => {
  it('renders the sign-in form on its route', () => {
    renderWithProviders(<LoginView />, {
      store: makeStore(),
      route: PATHS.LOGIN,
    })

    expect(
      screen.getByRole('heading', { level: 1, name: 'Sign in' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })
})
