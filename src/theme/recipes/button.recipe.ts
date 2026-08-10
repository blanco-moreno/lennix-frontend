import { defineRecipe } from '@chakra-ui/react'

export const buttonRecipe = defineRecipe({
  className: 'lennix-button',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    whiteSpace: 'nowrap',
    rounded: 'md',
    fontSize: 'sm',
    fontWeight: 'medium',
    transition: 'all 0.2s',
    flexShrink: 0,
    outline: 'none',
    cursor: 'pointer',
    _disabled: {
      pointerEvents: 'none',
      opacity: 0.5,
    },
    '& svg': {
      pointerEvents: 'none',
      flexShrink: 0,
    },
    '& svg:not([class*="size-"])': {
      width: 4,
      height: 4,
    },
    _focusVisible: {
      borderColor: 'ring',
      boxShadow: '0 0 0 3px {colors.ring/50}',
    },
    '&[aria-invalid="true"]': {
      borderColor: 'error',
      boxShadow: '0 0 0 3px {colors.error/20}',
    },
  },
  variants: {
    variant: {
      default: {
        bg: 'complementary',
        // Dark ink on the brand amber: white measures 2.02:1 there.
        color: 'complementary.fg',
        _hover: { bg: 'complementary/90' },
      },
      destructive: {
        bg: 'destructive',
        color: 'white',
        _hover: { bg: 'destructive/90' },
        _focusVisible: { boxShadow: '0 0 0 3px {colors.destructive/20}' },
      },
      outline: {
        borderWidth: '1px',
        borderColor: 'border',
        bg: 'bg.canvas',
        color: 'fg.default',
        _hover: { bg: 'accent', color: 'accent.fg' },
      },
      // Muted by default: ghost is the affordance you reach for, not the one
      // the page points at. Every call site was passing `color="fg.muted"`.
      ghost: {
        color: 'fg.muted',
        _hover: { bg: 'accent', color: 'accent.fg' },
      },
    },
    // Taller and roomier across the board: every button meets the 44px touch
    // floor on touch-sized viewports. `sm` only shrinks to 36px from lg up,
    // where a mouse is doing the aiming.
    /**
     * One scale, two densities. Every size renders compact below `lg` and at
     * its full metric from there: the phone reads as one register instead of
     * as desktop buttons that happen to be on a phone.
     *
     * Deliberate consequence: below `lg` these sit under the 44px WCAG touch
     * floor. That is a product decision taken against real devices — the full
     * targets read as oversized in a listing — and it is why `icon` keeps the
     * most height of the lot: an icon-only control has no label to aim at.
     */
    size: {
      default: {
        h: { base: 8, lg: 'touch' },
        px: { base: 3, lg: 5 },
        py: 2,
        fontSize: { base: 'xs', lg: 'sm' },
        '&:has(>svg)': { px: { base: 2.5, lg: 4 } },
      },
      sm: {
        h: { base: 7, lg: 9 },
        rounded: 'md',
        gap: 1.5,
        px: { base: 2.5, lg: 3.5 },
        fontSize: 'xs',
        '&:has(>svg)': { px: 2 },
      },
      // Badge-scale, for a control that rides inside a listing row next to the
      // badges rather than acting on the page.
      xs: {
        h: 7,
        rounded: 'md',
        gap: 1,
        px: 2,
        fontSize: 'xs',
        '&:has(>svg)': { px: 2 },
      },
      lg: {
        h: { base: 10, lg: 12 },
        rounded: 'md',
        px: { base: 5, lg: 7 },
        fontSize: { base: 'sm', lg: 'md' },
        '&:has(>svg)': { px: { base: 4, lg: 5 } },
      },
      icon: {
        w: { base: 9, lg: 'touch' },
        h: { base: 9, lg: 'touch' },
        rounded: 'md',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})
