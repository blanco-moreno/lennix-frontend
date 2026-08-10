import { useEffect, useState, type ReactNode } from 'react'
import { IntlProvider } from 'react-intl'

import { LoadingScreen } from '@/components/ui/loading-screen'
import { selectLocale } from '@/stores/slices/locale-slice'

import { useAppSelector } from '../../../stores/hooks'
import {
  DEFAULT_LOCALE,
  loadMessages,
  type LocaleMessages,
  type SupportedLocale,
} from '../../locale'
import { ImperativeIntlBridge } from '../imperative-intl-bridge'

type MessageBundles = Partial<Record<SupportedLocale, LocaleMessages>>

interface AppIntlProviderProps {
  children: ReactNode
}

/**
 * Loads compiled message bundles on demand. Renders the last-known locale
 * while the new one resolves; only the very first mount shows a LoadingScreen.
 */
export function AppIntlProvider({ children }: AppIntlProviderProps) {
  const locale = useAppSelector(selectLocale)
  const [bundles, setBundles] = useState<MessageBundles>({})

  useEffect(() => {
    if (bundles[locale]) return
    let cancelled = false
    void loadMessages(locale).then((messages) => {
      if (cancelled) return
      setBundles((prev) => ({ ...prev, [locale]: messages }))
    })
    return () => {
      cancelled = true
    }
  }, [locale, bundles])

  const fallbackLocale = pickFallbackLocale(bundles, locale)
  if (!fallbackLocale) return <LoadingScreen />

  const activeMessages = bundles[fallbackLocale]

  return (
    <IntlProvider
      key={fallbackLocale}
      locale={fallbackLocale}
      defaultLocale={DEFAULT_LOCALE}
      messages={activeMessages}
      onError={handleIntlError}
    >
      <ImperativeIntlBridge />
      {children}
    </IntlProvider>
  )
}

function pickFallbackLocale(
  bundles: MessageBundles,
  requested: SupportedLocale,
): SupportedLocale | null {
  if (bundles[requested]) return requested
  // Stick with whichever bundle we already have so we don't blank the
  // tree while the new locale loads.
  const cached = Object.keys(bundles) as SupportedLocale[]
  return cached[0] ?? null
}

function handleIntlError(err: unknown): void {
  if (import.meta.env.DEV) {
    console.warn('[intl]', err)
  }
}
