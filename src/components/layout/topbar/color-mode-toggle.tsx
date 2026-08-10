import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useIntl } from 'react-intl'

import { Button } from '../../ui/button'

import { topbarMessages as m } from './topbar-messages'

/**
 * Sun ↔ moon. Follows the OS until the user chooses; then the choice sticks.
 *
 * No mounted guard: this is a client-rendered SPA, so there is no server
 * markup for the first paint to disagree with.
 */
export function ColorModeToggle() {
  const intl = useIntl()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={intl.formatMessage(isDark ? m.toLightMode : m.toDarkMode)}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      data-testid="color-mode-toggle"
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
