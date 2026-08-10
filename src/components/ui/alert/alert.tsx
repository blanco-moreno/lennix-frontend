import {
  Box,
  chakra,
  Icon,
  useSlotRecipe,
  type HTMLChakraProps,
  type IconProps,
} from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'

import { alertRecipe } from '@/theme/recipes/alert.recipe'

export type AlertVariant =
  | 'default'
  | 'destructive'
  | 'critical'
  | 'overBudget'
  | 'error'

export interface AlertProps extends Omit<HTMLChakraProps<'div'>, 'color'> {
  variant?: AlertVariant | null
  icon?: LucideIcon
  iconProps?: IconProps
}

function Alert({
  variant = 'default',
  icon,
  iconProps,
  children,
  ...props
}: AlertProps) {
  const recipe = useSlotRecipe({ recipe: alertRecipe })
  const styles = recipe({ variant: variant ?? 'default', icon: !!icon })

  return (
    <chakra.div role="alert" css={styles.root} {...props}>
      {icon && (
        <Icon
          as={icon}
          boxSize={4}
          mt="0.125rem"
          color="currentColor"
          {...iconProps}
        />
      )}
      <Box css={styles.description}>{children}</Box>
    </chakra.div>
  )
}

export { Alert }
