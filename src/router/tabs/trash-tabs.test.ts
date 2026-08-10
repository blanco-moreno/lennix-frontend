import { DEFAULT_TRASH_TAB, TRASH_TABS, resolveTrashTab } from './trash-tabs'

describe('trash tabs', () => {
  it('is exactly the three kinds the papelera holds', () => {
    expect([...TRASH_TABS]).toEqual(['projects', 'tasks', 'expenses'])
    expect(DEFAULT_TRASH_TAB).toBe('projects')
  })

  // Parametrized per file rather than through a shared table: the four tab
  // resolvers do not share a signature, so a cross-feature helper would cost
  // more than these rows.
  it.each(['projects', 'tasks', 'expenses'] as const)(
    'resolves ?tab=%s to itself',
    (tab) => {
      expect(resolveTrashTab(tab)).toBe(tab)
    },
  )

  it.each([null, undefined, 'nonsense'])(
    'falls back to projects for %s',
    (raw) => {
      expect(resolveTrashTab(raw)).toBe('projects')
    },
  )
})
