import { Box, Flex } from '@chakra-ui/react'

import { Text } from '@/components'

export function LegendSwatch({
  color,
  label,
  dashed = false,
  hatched = false,
}: {
  color: string
  label: string
  dashed?: boolean
  /** Mirrors the bar's hatch, so the legend carries the non-hue cue too. */
  hatched?: boolean
}) {
  return (
    <Flex align="center" gap={1.5}>
      <Box
        w={4}
        h={2}
        rounded="sm"
        bg={dashed ? 'transparent' : color}
        backgroundImage={
          hatched
            ? `repeating-linear-gradient(45deg, ${color} 0 2px, rgba(255,255,255,0.55) 2px 4px)`
            : undefined
        }
        borderWidth={dashed ? '1px' : undefined}
        borderStyle={dashed ? 'dashed' : undefined}
        borderColor={dashed ? color : undefined}
      />
      <Text size="xs" color="muted">
        {label}
      </Text>
    </Flex>
  )
}
