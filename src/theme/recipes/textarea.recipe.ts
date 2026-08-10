import { defineRecipe } from '@chakra-ui/react'

import { inputBase } from './input.recipe'

export const textareaRecipe = defineRecipe({
  className: 'lennix-textarea',
  base: {
    ...inputBase,
    display: 'block',
    h: 'auto',
    minH: 20,
    py: 2,
    resize: 'vertical',
  },
})
