import { defineRecipe, type SystemStyleObject } from '@chakra-ui/react'

export const inputBase = {
  display: 'flex',
  w: 'full',
  minW: 0,
  h: 11,
  px: 3,
  py: 2,
  rounded: 'md',
  borderWidth: '1px',
  borderColor: 'border.input',
  bg: 'bg.input',
  fontSize: { base: 'md', md: 'sm' },
  color: 'fg.default',
  outline: 'none',
  transition: 'color, box-shadow',
  _placeholder: { color: 'fg.muted' },
  _selection: { bg: 'primary', color: 'primary.fg' },
  _disabled: {
    pointerEvents: 'none',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  _focusVisible: {
    borderColor: 'ring',
    boxShadow: '0 0 0 3px {colors.ring/50}',
  },
  '&[aria-invalid="true"]': {
    borderColor: 'error',
    boxShadow: '0 0 0 3px {colors.error/20}',
  },
  _dark: {
    '&[aria-invalid="true"]': {
      boxShadow: '0 0 0 3px {colors.error/40}',
    },
  },
} satisfies SystemStyleObject

export const inputRecipe = defineRecipe({
  className: 'lennix-input',
  base: inputBase,
  variants: {
    size: {
      sm: { h: 9, px: 2.5, fontSize: 'sm' },
      md: {},
      lg: { h: 12, px: 3.5, fontSize: 'md' },
    },
  },
  defaultVariants: { size: 'md' },
})
