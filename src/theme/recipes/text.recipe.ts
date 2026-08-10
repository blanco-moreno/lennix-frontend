import { defineRecipe } from '@chakra-ui/react'

export const textRecipe = defineRecipe({
  className: 'lennix-text',
  base: {
    lineHeight: 1.5,
    // Nothing here truncates, so a token with no space in it — a file name, a
    // URL, an id — had no way to fit and simply left the box. This lets it
    // break at the edge as a last resort; ordinary prose still breaks at
    // spaces, so it is not `break-all`.
    overflowWrap: 'break-word',
  },
  variants: {
    size: {
      xs: { fontSize: 'xs' },
      sm: { fontSize: 'sm' },
      base: { fontSize: 'md' },
      lg: { fontSize: 'lg' },
      xl: { fontSize: 'xl' },
      '2xl': { fontSize: '2xl' },
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
      white: { color: 'white' },
    },
    align: {
      left: { textAlign: 'left' },
      center: { textAlign: 'center' },
      right: { textAlign: 'right' },
      justify: { textAlign: 'justify' },
    },
    truncate: {
      true: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    color: 'default',
    align: 'left',
    truncate: false,
  },
})

export const TEXT_RECIPE_COLORS = new Set([
  'default',
  'muted',
  'primary',
  'secondary',
  'accent',
  'destructive',
  'critical',
  'overBudget',
  'error',
  'success',
  'warning',
  'info',
  'white',
])
