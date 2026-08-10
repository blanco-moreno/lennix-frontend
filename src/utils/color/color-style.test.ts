import type { ColorStyle } from './color-style'

describe('ColorStyle', () => {
  it('accepts every style prop the *-color helpers emit', () => {
    const style: ColorStyle = {
      bg: 'bg.muted',
      color: 'fg.muted',
      borderColor: 'border',
      borderLeftColor: 'primary',
      borderLeftWidth: '3px',
      _hover: { bg: 'warning/90', ringColor: 'border' },
      _focus: { color: 'destructive' },
    }
    expect(style.borderLeftColor).toBe('primary')
  })

  it('stays narrower than SystemStyleObject so it spreads onto any element', () => {
    // The whole point of the type: CSS `direction` must not be expressible,
    // because it clashes with Chakra Flex's `direction` prop when spread.
    // @ts-expect-error -- `direction` is deliberately not part of ColorStyle
    const clash: ColorStyle = { direction: 'rtl' }
    expect(clash).toBeDefined()
  })
})
