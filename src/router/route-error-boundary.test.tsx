import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router'

import { ThemeProvider } from '@/theme/provider'

import { renderWithIntl } from '../tests/with-intl'

import { RouteErrorBoundary } from './route-error-boundary'

function Boom(): never {
  throw new Error('kaboom')
}

function Shell({ children }: { children: ReactNode }) {
  return <div data-testid="app-shell">{children}</div>
}

describe('RouteErrorBoundary', () => {
  // `Boom` throws on purpose so the boundary has something to catch. React (in
  // dev) and React Router both re-log that caught error through console.error,
  // which Vitest surfaces as a stack trace next to a passing test. Silence it
  // here only — anywhere else an unexpected console.error should still be seen.
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a styled boundary instead of blanking the route', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <Boom />,
        errorElement: <RouteErrorBoundary />,
      },
    ])

    renderWithIntl(
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByText('This section could not be loaded'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Back to projects' }),
    ).toBeInTheDocument()
  })

  it('keeps the surrounding layout mounted when a child route throws', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <Shell>
              <Outlet />
            </Shell>
          ),
          children: [
            {
              path: 'broken',
              element: <Boom />,
              errorElement: <RouteErrorBoundary />,
            },
          ],
        },
      ],
      { initialEntries: ['/broken'] },
    )

    renderWithIntl(
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('app-shell')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
