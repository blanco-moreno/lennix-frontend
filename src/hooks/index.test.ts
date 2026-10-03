/**
 * Components import `@/hooks`, so a hook that imports the `@/components`
 * barrel makes the two barrels import each other — a cycle Rollup splits
 * across chunks. A hook that renders reaches each primitive by its folder.
 */
describe('the hooks layer', () => {
  it('never imports the @/components barrel', () => {
    const sources = import.meta.glob(
      ['/src/hooks/**/*.{ts,tsx}', '!/src/hooks/**/*.test.{ts,tsx}'],
      { eager: true, query: '?raw', import: 'default' },
    ) as Record<string, string>

    const offenders = Object.entries(sources)
      .filter(([, source]) => /from '@\/components'/.test(source))
      .map(([path]) => path)

    expect(Object.keys(sources).length).toBeGreaterThan(0)
    expect(offenders).toEqual([])
  })
})
