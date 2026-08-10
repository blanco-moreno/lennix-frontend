import { defineRecipe } from '@chakra-ui/react'

export const cardRecipe = defineRecipe({
  className: 'lennix-card',
  base: {
    display: 'flex',
    flexDirection: 'column',
    // The card owns its inside, gap and padding both: left to the consumers,
    // each picks its own and the app grows five padding scales.
    gap: 'section',
    padding: 'card',
    rounded: 'lg',
    borderWidth: '1px',
    borderColor: 'border',
    bg: 'bg.card',
    color: 'fg.default',
    shadow: 'sm',
  },
  variants: {
    size: {
      default: {},
      /** Stat tiles, meters, inline status — the same card, tighter. */
      compact: { padding: 'cardSm', gap: 'tight' },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})
