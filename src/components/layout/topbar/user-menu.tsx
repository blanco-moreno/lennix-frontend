import { Box, Flex, chakra } from '@chakra-ui/react'
import { Check, LogOut, Moon, Settings, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { PATHS } from '@/constants'
import { useSystemRoleName } from '@/hooks'
import { LOCALE_LABELS, SUPPORTED_LOCALES } from '@/i18n/locale'
import { useAppDispatch, useAppSelector } from '@/stores'
import { setLocale, selectLocale } from '@/stores/slices/locale-slice'
import type { User } from '@/types'

import { Avatar } from '../../ui/avatar'
import { DropdownMenu } from '../../ui/dropdown-menu'
import { Text } from '../../ui/text'

import { topbarMessages as m } from './topbar-messages'

/** A real `<button>`: the avatar is the menu's trigger, not a clickable div. */
const AvatarButton = chakra('button')

interface UserMenuProps {
  user?: User | null
  onLogout?: () => void
}

/**
 * Who is signed in, and the two settings pages plus sign-out that belong to
 * them. Behind an avatar rather than in the sidebar's footer, where they would
 * compete with navigation for the eye and for vertical space.
 */
export function UserMenu({ user, onLogout }: UserMenuProps) {
  const intl = useIntl()
  const navigate = useNavigate()
  // The backend's `role.name` is English reference data, not copy.
  const roleName = useSystemRoleName()(user?.roleId)
  const { resolvedTheme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const locale = useAppSelector(selectLocale)
  const isDark = resolvedTheme === 'dark'

  if (!user) return null

  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <DropdownMenu
      align="end"
      trigger={
        <AvatarButton
          type="button"
          rounded="full"
          aria-label={intl.formatMessage(m.userMenu, { name: fullName })}
          data-testid="user-menu-trigger"
          _focusVisible={{
            outline: '2px solid',
            outlineColor: 'ring',
            outlineOffset: '2px',
          }}
        >
          <Avatar
            boxSize={9}
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}+${user.lastName}`}
            name={fullName}
            fallbackProps={{ bg: 'complementary', color: 'complementary.fg' }}
          />
        </AvatarButton>
      }
      items={[
        {
          // Not a menu item: the header of the menu. Disabled so it reads as
          // a label and never as something to click.
          label: (
            <Flex direction="column" gap={0} py={1}>
              <Text size="sm" weight="medium">
                {fullName}
              </Text>
              <Text size="xs" color="muted">
                {roleName ?? user.email}
              </Text>
            </Flex>
          ),
          disabled: true,
          itemProps: { _disabled: { opacity: 1, cursor: 'default' } },
        },
        { type: 'separator' },
        {
          icon: Settings,
          label: intl.formatMessage(m.settings),
          onSelect: () => void navigate(PATHS.SETTINGS),
        },
        // Preferences live as loose topbar buttons from `lg` up; on a phone
        // that row costs the title ~120px, so it folds in here instead.
        {
          icon: isDark ? Sun : Moon,
          label: intl.formatMessage(isDark ? m.toLightMode : m.toDarkMode),
          onSelect: () => setTheme(isDark ? 'light' : 'dark'),
          itemProps: { hideFrom: 'lg' } as const,
        },
        ...SUPPORTED_LOCALES.map((option) => ({
          label: (
            <>
              <Box as="span">{LOCALE_LABELS[option]}</Box>
              {option === locale && <Box as={Check} boxSize={4} />}
            </>
          ),
          onSelect: () => {
            if (option !== locale) dispatch(setLocale(option))
          },
          itemProps: {
            hideFrom: 'lg',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          } as const,
        })),
        { type: 'separator' },
        {
          icon: LogOut,
          label: intl.formatMessage(m.logout),
          onSelect: onLogout,
        },
      ]}
    />
  )
}
