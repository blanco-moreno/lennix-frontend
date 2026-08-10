/**
 * The composed app boots: store + theme + intl + router wired together in
 * `App`. An unauthenticated visit at `/` must travel the real route table
 * (root → dashboard → AuthGuard → login) and land on the sign-in form in the
 * launch locale — if any provider in the stack is miswired, nothing renders.
 */

import { render, screen, waitFor } from '@testing-library/react'

import { PATHS } from '@/constants'

import App from './App'

describe('App', () => {
  it('boots an unauthenticated visit to the login screen', async () => {
    render(<App />)

    // The default locale is 'es', so the composed surface speaks Spanish.
    expect(
      await screen.findByRole(
        'button',
        { name: 'Iniciar Sesión' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument()
    await waitFor(() => expect(window.location.pathname).toBe(PATHS.LOGIN))
  })
})
