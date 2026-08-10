import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider as ColorModeProvider } from 'next-themes'
import type { ReactNode } from 'react'

import { system } from './theme'

/**
 * Chakra + color mode. `next-themes` stamps `.dark` on <html> (Chakra's
 * `_dark` condition matches it), follows the OS preference by default and
 * persists an explicit choice — the topbar toggle just calls `setTheme`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ColorModeProvider attribute="class" disableTransitionOnChange>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </ColorModeProvider>
  )
}
