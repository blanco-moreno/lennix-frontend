import {
  chakra,
  useRecipe,
  type HTMLChakraProps,
  type RecipeVariantProps,
} from '@chakra-ui/react'
import * as React from 'react'

import { headingRecipe } from '@/theme/recipes/heading.recipe'

type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type HeadingVariantProps = RecipeVariantProps<typeof headingRecipe>

interface HeadingProps
  extends Omit<HTMLChakraProps<'h2'>, 'color' | 'as'>, HeadingVariantProps {
  as?: HeadingElement
}

const ChakraHeading = chakra('h2')

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ size = 'h2', weight, color, align, as, ...props }, ref) => {
    const recipe = useRecipe({ recipe: headingRecipe })
    const Component = (as || size || 'h2') as HeadingElement

    return (
      <ChakraHeading
        as={Component}
        ref={ref}
        css={recipe({ size, weight, color, align })}
        {...props}
      />
    )
  },
)
Heading.displayName = 'Heading'

export { Heading }
