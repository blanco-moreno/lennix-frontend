import enMessages from '../../lang/en.json'
import esMessages from '../../lang/es.json'
import ptMessages from '../../lang/pt-BR.json'

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, resolveLocale } from './locale'

/**
 * Strings that are deliberately identical in Spanish: symbols, pure-ICU
 * templates, PDM relationship acronyms (FS/SS/FF/SF are the international
 * notation) and words Spanish uses as-is.
 */
const SHARED_WITH_ENGLISH = new Set([
  'budgetApprovals.rowDelta',
  'dependencyEditor.edgeLabel',
  'dependencyEditor.relationshipFF',
  'dependencyEditor.relationshipFS',
  'dependencyEditor.relationshipSF',
  'dependencyEditor.relationshipSS',
  // "{size} KB" is a unit, not a sentence — same in all three locales.
  'importDropzone.fileSize',
  // "{field}: {value}" is a template whose two halves arrive already
  // translated, and "No" is the Spanish word for no — not an untranslated
  // English one.
  'listFilterBar.chipValue',
  'listFilterBar.optionNo',
  'narrationReceipt.dateRange',
  // "{start} → {end}" is pure notation — same in all three locales.
  'projectRow.dateRange',
  // "+{n}" is the overflow counter's notation, not a word.
  'projectRow.moreBadges',
  'taskDetail.badgeOverflow',
  'taskRow.moreBadges',
  'organization.planLabel',
  'organization.slugLabel',
  'pagination.pageOfTotal',
  'priority.normal',
  'scheduleCanvas.dateRange',
  // "{progress}%" is a unit, and the aria string is pure ICU notation joined
  // by "·" — same in all three locales.
  'scheduleGantt.progressLabel',
  'scheduleGantt.rowAria',
  'scheduleGantt.rowAriaDraft',
  'sidebar.roleFallback',
  // "Admin" is the role's name in all three locales — the product calls it
  // that, not "Administrador".
  'systemRole.admin',
  // Punctuation joining the fragments of a composed sentence — the same
  // separator in all three locales.
  'taskDetail.blockedListSeparator',
  'trustCopy.listSeparator',
])

describe('launch locale', () => {
  it('defaults to Spanish (the Chilean-contractor beachhead)', () => {
    expect(DEFAULT_LOCALE).toBe('es')
  })

  it('still offers English and Brazilian Portuguese in the switcher', () => {
    expect([...SUPPORTED_LOCALES]).toEqual(['en', 'es', 'pt-BR'])
  })

  it('resolves to the default when nothing is persisted', () => {
    window.localStorage.removeItem('lennix.locale')
    expect(resolveLocale()).toBe('es')
  })

  it('keeps an explicit user choice over the default', () => {
    window.localStorage.setItem('lennix.locale', 'en')
    expect(resolveLocale()).toBe('en')
    window.localStorage.removeItem('lennix.locale')
  })
})

describe('message catalogs', () => {
  it('has no key missing from es (launch gate) or pt-BR', () => {
    const en = Object.keys(enMessages).sort()
    expect(Object.keys(esMessages).sort()).toEqual(en)
    expect(Object.keys(ptMessages).sort()).toEqual(en)
  })

  it('has no empty translation', () => {
    for (const [key, value] of Object.entries(esMessages)) {
      expect(value.trim(), `es.json ${key} is empty`).not.toBe('')
    }
  })

  // The three files agreeing with each other is not enough: they can agree on
  // a key the code renamed. A message id with no catalog entry silently falls
  // back to its English defaultMessage in every locale — which is exactly how
  // "Spent" shipped untranslated on the project card.
  it('has a catalog entry for every id the code defines', () => {
    const modules = import.meta.glob('/src/**/*-messages.ts', {
      eager: true,
      query: '?raw',
      import: 'default',
    }) as Record<string, string>

    const orphans = Object.entries(modules).flatMap(([file, source]) =>
      [...source.matchAll(/id:\s*'([^']+)'/g)]
        .map(([, id]) => id)
        .filter((id) => !(id in enMessages))
        .map((id) => `${id} (${file})`),
    )

    expect(orphans).toEqual([])
  })

  it('leaks no English into es beyond the shared-notation allowlist', () => {
    const leaked = Object.entries(esMessages)
      .filter(
        ([key, value]) =>
          value === (enMessages as Record<string, string>)[key] &&
          !SHARED_WITH_ENGLISH.has(key),
      )
      .map(([key]) => key)

    expect(leaked).toEqual([])
  })
})
