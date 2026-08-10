// Style-prop shape returned by the `*-color.ts` helpers. Narrower than
// `SystemStyleObject` so it spreads onto any Chakra element without type clashes
// (notably CSS `direction` vs. Chakra `Flex`'s `direction` prop).
export type ColorStyle = {
  bg?: string
  color?: string
  borderColor?: string
  borderLeftColor?: string
  borderLeftWidth?: string
  _hover?: { bg?: string; color?: string; ringColor?: string }
  _focus?: { color?: string }
}
