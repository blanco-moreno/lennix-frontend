/**
 * The app's Chakra boundary: `ThemeProvider` must hand descendants the lennix
 * `system` (so brand recipes and tokens resolve), not Chakra's default theme.
 * The token values themselves are pinned in `theme.test.ts`.
 */

import { useChakraContext } from '@chakra-ui/react'
import { render, renderHook, screen } from '@testing-library/react'

import { ThemeProvider } from './provider'
import { system } from './theme'

describe('ThemeProvider', () => {
  it('renders its children', () => {
    render(
      <ThemeProvider>
        <button>inside</button>
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: 'inside' })).toBeInTheDocument()
  })

  it('provides the lennix system, so brand tokens resolve for descendants', () => {
    const { result } = renderHook(() => useChakraContext(), {
      wrapper: ThemeProvider,
    })

    expect(result.current.token('colors.brand.800')).toBeTruthy()
    expect(result.current.token('colors.brand.800')).toBe(
      system.token('colors.brand.800'),
    )
  })
})
