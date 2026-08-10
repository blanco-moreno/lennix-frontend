import { chakra, useRecipe, type RecipeVariantProps } from '@chakra-ui/react'
import * as React from 'react'

import { TEXT_RECIPE_COLORS, textRecipe } from '@/theme/recipes/text.recipe'

type TextRecipeVariantProps = RecipeVariantProps<typeof textRecipe>
type TextColorKey =
  | 'default'
  | 'muted'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'destructive'
  | 'critical'
  | 'overBudget'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'white'
type TextVariantProps = Omit<TextRecipeVariantProps, 'color'> & {
  color?: TextColorKey | (string & {}) | null
}

type TextElement = 'p' | 'span' | 'label' | 'small' | 'strong' | 'em'

interface BaseTextProps extends TextVariantProps {
  htmlFor?: string
}

type ChakraTextProps = Omit<
  React.ComponentProps<typeof ChakraText>,
  'color' | 'truncate' | 'as'
>

interface TextAsChildProps extends BaseTextProps, ChakraTextProps {
  asChild: true
  as?: never
}

interface TextWithElementProps extends BaseTextProps, ChakraTextProps {
  asChild?: false
  as?: TextElement
}

type TextProps = TextAsChildProps | TextWithElementProps

const ChakraText = chakra('p')

const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      size,
      weight,
      color,
      align,
      truncate,
      as = 'p',
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const recipe = useRecipe({ recipe: textRecipe })
    const isNamedColor =
      color === undefined || color === null || TEXT_RECIPE_COLORS.has(color)
    const styles = {
      ...recipe({
        size,
        weight,
        align,
        truncate,
        color: isNamedColor ? (color as TextColorKey) : undefined,
      }),
      ...(!isNamedColor && color ? { color } : {}),
    }

    if (asChild) {
      const { children, ...rest } = props
      return (
        <chakra.span
          css={styles}
          ref={ref as React.Ref<HTMLSpanElement>}
          {...rest}
          asChild
        >
          {children as React.ReactNode}
        </chakra.span>
      )
    }

    const Component = as as TextElement
    return (
      <ChakraText
        as={Component}
        css={styles}
        ref={ref as React.Ref<HTMLParagraphElement>}
        {...props}
      />
    )
  },
)
Text.displayName = 'Text'

export { Text }
