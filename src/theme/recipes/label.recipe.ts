import { defineRecipe } from '@chakra-ui/react'

export const labelRecipe = defineRecipe({
  className: 'lennix-label',
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 'sm',
    lineHeight: '1',
    fontWeight: 'medium',
    userSelect: 'none',
    '.group[data-disabled=true] &': {
      pointerEvents: 'none',
      opacity: 0.5,
    },
    '.peer:disabled ~ &': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
})
