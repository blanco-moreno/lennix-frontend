/**
 * `@/features` re-exports every feature, so a feature that imports the barrel
 * imports itself back — a cycle Rollup splits across chunks. A feature reaches
 * another by its folder.
 */
describe('the features layer', () => {
  it('never imports the @/features barrel', () => {
    const sources = import.meta.glob(
      ['/src/features/**/*.{ts,tsx}', '!/src/features/**/*.test.{ts,tsx}'],
      { eager: true, query: '?raw', import: 'default' },
    ) as Record<string, string>

    const offenders = Object.entries(sources)
      .filter(([, source]) => /from '@\/features'/.test(source))
      .map(([path]) => path)

    expect(Object.keys(sources).length).toBeGreaterThan(0)
    expect(offenders).toEqual([])
  })
})
