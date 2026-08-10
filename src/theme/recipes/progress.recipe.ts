import { defineSlotRecipe } from '@chakra-ui/react'

export const progressRecipe = defineSlotRecipe({
  className: 'lennix-progress',
  slots: ['track', 'indicator'],
  base: {
    track: {
      w: 'full',
      rounded: 'full',
      bg: 'bg.muted',
      overflow: 'hidden',
    },
    indicator: {
      h: 'full',
      rounded: 'full',
      bg: 'brand.solid',
      transition: 'width 0.3s ease',
    },
  },
})
