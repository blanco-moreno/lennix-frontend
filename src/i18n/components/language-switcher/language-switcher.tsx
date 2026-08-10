import { Box } from '@chakra-ui/react'
import { Check, Languages } from 'lucide-react'
import { useIntl } from 'react-intl'

import {
  Button,
  type ButtonProps,
  DropdownMenu,
  type DropdownMenuProps,
} from '@/components'
import { useAppDispatch, useAppSelector } from '@/stores'
import { setLocale, selectLocale } from '@/stores/slices/locale-slice'

import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  loadMessages,
  type SupportedLocale,
} from '../../locale'

import { languageSwitcherMessages } from './language-switcher-messages'

export interface LanguageSwitcherProps {
  buttonProps?: ButtonProps
  placement?: DropdownMenuProps['placement']
}

export function LanguageSwitcher({
  buttonProps,
  placement,
}: LanguageSwitcherProps = {}) {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const current = useAppSelector(selectLocale)

  const handleSelect = (locale: SupportedLocale): void => {
    if (locale === current) return
    dispatch(setLocale(locale))
  }

  // Pre-fetch alternate locale on hover so the switch is instant if the
  // bundle wasn't already cached.
  const handleHover = (locale: SupportedLocale): void => {
    if (locale === current) return
    void loadMessages(locale)
  }

  const ariaLabel = intl.formatMessage(languageSwitcherMessages.buttonAriaLabel)
  const tooltip = intl.formatMessage(languageSwitcherMessages.buttonTooltip, {
    label: LOCALE_LABELS[current],
  })

  return (
    <DropdownMenu
      trigger={
        <Button
          variant="ghost"
          size="sm"
          aria-label={ariaLabel}
          title={tooltip}
          gap={1.5}
          {...buttonProps}
        >
          <Box as={Languages} boxSize={4} />
          <Box
            as="span"
            fontSize="xs"
            fontWeight="medium"
            textTransform="uppercase"
          >
            {current}
          </Box>
        </Button>
      }
      align="end"
      placement={placement}
      items={SUPPORTED_LOCALES.map((locale) => ({
        label: (
          <>
            <Box as="span">{LOCALE_LABELS[locale]}</Box>
            {locale === current && <Box as={Check} boxSize={4} />}
          </>
        ),
        onSelect: () => handleSelect(locale),
        itemProps: {
          onMouseEnter: () => handleHover(locale),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      }))}
    />
  )
}
