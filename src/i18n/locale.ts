/**
 * Locale resolution, persistence and on-demand bundle loading.
 * Deliberately no auto-detection via navigator.language — an explicit switch
 * is the only way to leave the default locale.
 */

import { LOCAL_STORAGE_KEYS } from '@/constants'

export type SupportedLocale = 'en' | 'es' | 'pt-BR'

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  'en',
  'es',
  'pt-BR',
] as const
export const DEFAULT_LOCALE: SupportedLocale = 'es'

const STORAGE_KEY = LOCAL_STORAGE_KEYS.LOCALE

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  // Each label is rendered in its own language by convention.
  en: 'English',
  es: 'Español',
  'pt-BR': 'Português (Brasil)',
}

function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export function resolveLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored && isSupportedLocale(stored)) return stored
  return DEFAULT_LOCALE
}

export function persistLocale(locale: SupportedLocale): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, locale)
}

export type LocaleMessages = Record<string, string>

/**
 * Dynamically import the raw message catalog for a locale. The files in
 * `lang/` are flat `{ id: 'translated string' }` maps maintained by hand;
 * react-intl parses any ICU placeholders at call time.
 */
export async function loadMessages(
  locale: SupportedLocale,
): Promise<LocaleMessages> {
  const mod = await import(`../../lang/${locale}.json`)
  return (mod.default ?? mod) as LocaleMessages
}
