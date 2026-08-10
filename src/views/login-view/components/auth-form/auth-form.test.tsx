import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { LOCAL_STORAGE_KEYS } from '@/constants'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { selectAccessToken } from '@/stores/slices/auth-slice'
import { seedAccessTokenDTO, seedCurrentUserDTO } from '@/tests/fixtures'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { AuthForm } from './auth-form'

/** The demo login (Carlos) — the account the seeded backend actually accepts. */
const SEED_EMAIL = seedCurrentUserDTO().email
/** Not a seed fact: the seed manifest carries no passwords. */
const FIXTURE_PASSWORD = 'demo-password-1'

function renderForm() {
  const store = makeStore()
  const view = renderWithProviders(<AuthForm />, { store, route: '/login' })
  return { store, view }
}

async function submitCredentials(email: string, password: string) {
  await userEvent.type(screen.getByLabelText('Email'), email)
  await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('AuthForm', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('signs in against the real auth handler: credentials go out form-encoded, tokens land, and it hands the destination to the role-aware home', async () => {
    const bodies: string[] = []
    server.use(
      http.post('*/v1/auth/access-token', async ({ request }) => {
        bodies.push(await request.text())
        return HttpResponse.json(seedAccessTokenDTO())
      }),
    )

    const { store } = renderForm()
    await userEvent.click(screen.getByRole('checkbox'))
    await submitCredentials(SEED_EMAIL, FIXTURE_PASSWORD)

    // Not `/dashboard`: the role that decides which home this is has not
    // resolved yet here, so the form lands on `/` and `HomeRedirect` chooses.
    await waitFor(() => {
      expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(/^\/$/)
    })
    const expectedBody = new URLSearchParams({
      username: SEED_EMAIL,
      password: FIXTURE_PASSWORD,
    }).toString()
    expect(bodies).toEqual([expectedBody])
    expect(selectAccessToken(store.getState())).toBe(
      seedAccessTokenDTO().access_token,
    )
    // "Remember me" was checked, so the email is kept for the next visit.
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.REMEMBERED_EMAIL)).toBe(
      SEED_EMAIL,
    )
  })

  it('shows the failed-sign-in copy on bad credentials and stays on the login page', async () => {
    server.use(
      http.post(
        '*/v1/auth/access-token',
        () => new HttpResponse(null, { status: 401 }),
      ),
    )

    renderForm()
    await submitCredentials(SEED_EMAIL, 'wrong-password')

    expect(
      await screen.findByText(
        'Could not sign in. Please check your credentials.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent('/login')
  })

  it('prefills the remembered email, and forgets it when the user signs in with "Remember me" off', async () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REMEMBERED_EMAIL, SEED_EMAIL)

    renderForm()

    expect(screen.getByLabelText('Email')).toHaveValue(SEED_EMAIL)
    expect(screen.getByRole('checkbox')).toBeChecked()

    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.type(screen.getByLabelText('Password'), FIXTURE_PASSWORD)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(
        localStorage.getItem(LOCAL_STORAGE_KEYS.REMEMBERED_EMAIL),
      ).toBeNull()
    })
  })

  it('refuses an empty submit with the required-field copy', async () => {
    renderForm()

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('Username/email is required'),
    ).toBeInTheDocument()
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent('/login')
  })
})
