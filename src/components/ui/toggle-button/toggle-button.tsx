import * as React from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'

export type ToggleButtonProps = Omit<ButtonProps, 'variant' | 'asChild'> & {
  pressed: boolean
}

/**
 * Single home for the schedule's on/off controls, which kept drifting back to
 * raw chakra('button') with px/py/fontSize overrides — losing the button
 * recipe, the touch floor and dark mode (hardcoded gray.200 borders).
 */
const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ pressed, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      aria-pressed={pressed}
      h={{ base: 'touch', lg: 9 }}
      borderColor={pressed ? 'complementary' : 'border'}
      bg={pressed ? 'complementary/10' : undefined}
      color={pressed ? 'complementary' : 'fg.muted'}
      {...props}
    />
  ),
)
ToggleButton.displayName = 'ToggleButton'

export { ToggleButton }
