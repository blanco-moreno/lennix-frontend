import { Box, useSlotRecipe, type BoxProps } from '@chakra-ui/react'

import { progressRecipe } from '@/theme/recipes/progress.recipe'

type ProgressProps = Omit<BoxProps, 'value'> & {
  value?: number | null
  indicatorProps?: BoxProps
}

function Progress({ value, h = 2, indicatorProps, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value ?? 0))
  const recipe = useSlotRecipe({ recipe: progressRecipe })
  const styles = recipe()

  return (
    <Box data-slot="progress" css={styles.track} h={h} {...props}>
      <Box
        data-slot="progress-indicator"
        css={styles.indicator}
        width={`${pct}%`}
        {...indicatorProps}
      />
    </Box>
  )
}

export { Progress }
