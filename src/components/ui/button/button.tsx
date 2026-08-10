import { chakra, useRecipe } from '@chakra-ui/react'
import * as React from 'react'

import { buttonRecipe } from '@/theme/recipes/button.recipe'

const StyledButton = chakra('button', buttonRecipe)

export type ButtonProps = React.ComponentProps<typeof StyledButton> & {
  asChild?: boolean
}

const SlottedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, children, ...props }, ref) => {
    const recipe = useRecipe({ recipe: buttonRecipe })
    const styles = recipe({ variant, size })

    return (
      <chakra.span
        css={styles}
        ref={ref as React.Ref<HTMLSpanElement>}
        {...props}
        asChild
      >
        {children}
      </chakra.span>
    )
  },
)
SlottedButton.displayName = 'SlottedButton'

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, ...props }, ref) => {
    if (asChild) return <SlottedButton ref={ref} {...props} />
    return <StyledButton ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button }
