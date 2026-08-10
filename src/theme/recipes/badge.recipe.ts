import { defineRecipe } from '@chakra-ui/react'

export const badgeRecipe = defineRecipe({
  className: 'lennix-badge',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    rounded: 'md',
    borderWidth: '1px',
    px: 2,
    py: 0.5,
    fontSize: 'xs',
    fontWeight: 'medium',
    width: 'fit-content',
    // A badge is a chip until it is a sentence: "44 days of critical-path
    // slip" does not fit a phone's line, and `nowrap` + `overflow: hidden`
    // clipped it rather than saying so. Short badges never reach the wrap;
    // long ones take a second line instead of losing their end.
    maxW: 'full',
    whiteSpace: 'normal',
    flexShrink: 0,
    gap: 1,
    overflow: 'hidden',
    transitionProperty: 'color, box-shadow',
    '& > svg': {
      width: 3,
      height: 3,
      pointerEvents: 'none',
    },
    _focusVisible: {
      borderColor: 'ring',
      boxShadow: '0 0 0 3px {colors.ring/50}',
    },
    '&[aria-invalid="true"]': {
      borderColor: 'error',
      boxShadow: '0 0 0 3px {colors.error/20}',
      _dark: {
        boxShadow: '0 0 0 3px {colors.error/40}',
      },
    },
  },
  variants: {
    variant: {
      default: {
        borderColor: 'transparent',
        bg: 'primary',
        color: 'primary.fg',
        'a&': { _hover: { bg: 'primary/90' } },
      },
      secondary: {
        borderColor: 'transparent',
        bg: 'secondary',
        color: 'secondary.fg',
        'a&': { _hover: { bg: 'secondary/90' } },
      },
      destructive: {
        borderColor: 'transparent',
        bg: 'destructive',
        color: 'white',
        'a&': { _hover: { bg: 'destructive/90' } },
        _focusVisible: { boxShadow: '0 0 0 3px {colors.destructive/20}' },
        _dark: {
          bg: 'destructive/60',
          _focusVisible: { boxShadow: '0 0 0 3px {colors.destructive/40}' },
        },
      },
      critical: {
        borderColor: 'transparent',
        bg: 'critical',
        color: 'white',
        'a&': { _hover: { bg: 'critical/90' } },
        _focusVisible: { boxShadow: '0 0 0 3px {colors.critical/20}' },
        _dark: {
          bg: 'critical/60',
          _focusVisible: { boxShadow: '0 0 0 3px {colors.critical/40}' },
        },
      },
      overBudget: {
        borderColor: 'transparent',
        bg: 'overBudget',
        color: 'white',
        'a&': { _hover: { bg: 'overBudget/90' } },
        _focusVisible: { boxShadow: '0 0 0 3px {colors.overBudget/20}' },
        _dark: {
          bg: 'overBudget/60',
          _focusVisible: { boxShadow: '0 0 0 3px {colors.overBudget/40}' },
        },
      },
      error: {
        borderColor: 'transparent',
        bg: 'error',
        color: 'white',
        'a&': { _hover: { bg: 'error/90' } },
        _focusVisible: { boxShadow: '0 0 0 3px {colors.error/20}' },
        _dark: {
          bg: 'error/60',
          _focusVisible: { boxShadow: '0 0 0 3px {colors.error/40}' },
        },
      },
      outline: {
        color: 'fg.default',
        'a&': { _hover: { bg: 'accent', color: 'accent.fg' } },
      },
      complementary: {
        bg: 'complementary/10',
        color: 'complementary',
        borderColor: 'complementary/20',
      },
      warning: {
        bg: 'warning/10',
        color: 'warning',
        borderColor: 'warning/20',
      },
      /** Time lost. See the `delayed` semantic token. */
      delayed: {
        bg: 'delayed/10',
        color: 'delayed',
        borderColor: 'delayed/20',
      },
      /**
       * Priority lives in its own visual register: **hollow**, where every
       * state badge is a tinted fill.
       *
       * Colour alone could not carry it — medium priority was the same orange
       * as "blocked" and high the same red as "delayed", so an attribute of the
       * work looked exactly like something happening to it. Keeping the hue but
       * dropping the fill separates the two at a glance, and reading order
       * still favours state, which is what a jefe de obra acts on first.
       */
      'priority-high': {
        bg: 'transparent',
        color: 'priority.high',
        borderColor: 'priority.high/40',
      },
      'priority-medium': {
        bg: 'transparent',
        color: 'priority.medium',
        borderColor: 'priority.medium/40',
      },
      'priority-low': {
        bg: 'transparent',
        color: 'priority.low',
        borderColor: 'priority.low/40',
      },
      'destructive-soft': {
        bg: 'destructive/10',
        color: 'destructive',
        borderColor: 'destructive/20',
      },
      'critical-soft': {
        bg: 'critical/10',
        color: 'critical',
        borderColor: 'critical/20',
      },
      'overBudget-soft': {
        bg: 'overBudget/10',
        color: 'overBudget',
        borderColor: 'overBudget/20',
      },
      'error-soft': {
        bg: 'error/10',
        color: 'error',
        borderColor: 'error/20',
      },
      info: {
        bg: 'info/10',
        color: 'info',
        borderColor: 'info/20',
      },
      success: {
        bg: 'success/10',
        color: 'success',
        borderColor: 'success/20',
      },
      gray: {
        bg: 'bg.muted',
        color: 'fg.muted',
        borderColor: 'border',
      },
      'red-critical': {
        bg: 'red.100',
        color: 'red.800',
        borderColor: 'red.200',
      },
      'status-active': {
        bg: 'status.active/20',
        color: 'status.active',
        borderColor: 'status.active/30',
      },
      'status-monitoring': {
        bg: 'status.monitoring/20',
        color: 'status.monitoring',
        borderColor: 'status.monitoring/30',
      },
      'primary-soft': {
        bg: 'primary/10',
        color: 'primary',
        borderColor: 'primary/20',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
