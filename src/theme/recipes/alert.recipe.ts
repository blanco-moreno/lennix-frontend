import { defineSlotRecipe } from '@chakra-ui/react'

export const alertRecipe = defineSlotRecipe({
  className: 'lennix-alert',
  slots: ['root', 'description'],
  base: {
    root: {
      position: 'relative',
      w: 'full',
      rounded: 'lg',
      borderWidth: '1px',
      borderColor: 'border',
      px: 4,
      py: 3,
      fontSize: 'sm',
      display: 'grid',
      rowGap: 0.5,
      alignItems: 'start',
    },
    description: {
      display: 'grid',
      justifyItems: 'start',
      gap: 1,
      fontSize: 'sm',
      '& p': { lineHeight: 'relaxed' },
    },
  },
  variants: {
    variant: {
      default: {
        root: { bg: 'bg.card', color: 'fg.default' },
        description: { color: 'fg.muted' },
      },
      destructive: {
        root: { bg: 'bg.card', color: 'destructive' },
        description: { color: 'destructive/90' },
      },
      critical: {
        root: { bg: 'bg.card', color: 'critical' },
        description: { color: 'critical/90' },
      },
      overBudget: {
        root: { bg: 'bg.card', color: 'overBudget' },
        description: { color: 'overBudget/90' },
      },
      error: {
        root: { bg: 'bg.card', color: 'error' },
        description: { color: 'error/90' },
      },
    },
    icon: {
      true: {
        root: { gridTemplateColumns: '1rem 1fr', columnGap: 3 },
      },
      false: {
        root: { gridTemplateColumns: '1fr', columnGap: 0 },
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    icon: false,
  },
})
