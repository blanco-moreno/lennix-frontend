import { Box, useRecipe, type BoxProps } from '@chakra-ui/react'
import * as React from 'react'

import { cardRecipe } from '@/theme/recipes/card.recipe'

export interface CardProps extends BoxProps {
  header?: React.ReactNode
  /** Layout of the content block — not its padding, which the card owns. */
  contentProps?: BoxProps
  /** `compact` for stat tiles, meters and inline status blocks. */
  size?: 'default' | 'compact'
}

function Card({ header, contentProps, size, children, ...props }: CardProps) {
  const recipe = useRecipe({ recipe: cardRecipe })

  return (
    <Box css={recipe({ size })} {...props}>
      {/*
        The header is a block of the card, not a padded region of its own —
        the card's own padding reaches it, and the recipe gap separates it
        from the content. Re-declaring `px={6} pt={6}` here is how a second
        padding scale gets into the app.
      */}
      {header ? (
        <>
          <Box display="flex" flexDirection="column" gap={1.5}>
            {header}
          </Box>
          <Box {...contentProps}>{children}</Box>
        </>
      ) : (
        children
      )}
    </Box>
  )
}

export { Card }
