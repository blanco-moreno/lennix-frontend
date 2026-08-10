import { defineRecipe } from '@chakra-ui/react'

export const headingRecipe = defineRecipe({
  className: 'lennix-heading',
  base: {
    lineHeight: 1.3,
    textWrap: 'balance',
  },
  variants: {
    // One notch up across the board, with tighter tracking at the top: the
    // old scale peaked at 2xl, which read as a bold paragraph, not a title.
    size: {
      h1: { fontSize: '3xl', letterSpacing: '-0.02em' },
      h2: { fontSize: '2xl', letterSpacing: '-0.01em' },
      h3: { fontSize: 'xl' },
      h4: { fontSize: 'lg' },
      h5: { fontSize: 'md' },
      h6: { fontSize: 'sm' },
    },
    weight: {
      normal: { fontWeight: 'normal' },
      medium: { fontWeight: 'medium' },
      semibold: { fontWeight: 'semibold' },
      bold: { fontWeight: 'bold' },
    },
    color: {
      default: { color: 'fg.default' },
      muted: { color: 'fg.muted' },
      primary: { color: 'primary' },
      secondary: { color: 'secondary.fg' },
      accent: { color: 'accent' },
      destructive: { color: 'destructive' },
      critical: { color: 'critical' },
      overBudget: { color: 'overBudget' },
      error: { color: 'error' },
      success: { color: 'success' },
      warning: { color: 'warning' },
      info: { color: 'info' },
    },
    align: {
      left: { textAlign: 'left' },
      center: { textAlign: 'center' },
      right: { textAlign: 'right' },
    },
  },
  defaultVariants: {
    size: 'h2',
    weight: 'semibold',
    color: 'default',
    align: 'left',
  },
})
