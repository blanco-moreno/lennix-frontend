import { Flex, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import type { ColorStyle } from '@/utils'

import { Heading } from '../heading'
import { Progress } from '../progress'
import { Text } from '../text'

interface ProgressPanelProps {
  heading: ReactNode
  /** The dates shown to the right of the heading, already formatted. */
  dates: Array<{ label: ReactNode; value: string }>
  value: number
  /**
   * The bar's fill, already resolved by the caller.
   *
   * The panel deliberately does not know the vocabulary: an activity's bar
   * comes from `getProgressColor`, a project's from `getProjectProgressColor`,
   * and the two answer to different sources of truth.
   */
  indicator: ColorStyle
}

/**
 * The tinted progress card in the activity and project detail headers: a
 * heading on the left, the start/due dates on the right, and the coloured
 * progress bar under both. The two detail headers share this exact block, so
 * its look (radius, padding, tint, bar height) lives here once.
 */
export function ProgressPanel({
  heading,
  dates,
  value,
  indicator,
}: ProgressPanelProps) {
  return (
    <Stack gap={4} rounded="xl" px={6} py={5} bg="bg.muted/30">
      <Flex align="center" justify="space-between" gap={4} wrap="wrap">
        <Heading size="h4">{heading}</Heading>
        <Flex align="center" gap={6}>
          {dates.map((date, index) => (
            <Text key={index} size="sm" color="muted">
              {date.label}
              {': '}
              {date.value}
            </Text>
          ))}
        </Flex>
      </Flex>
      <Progress value={value} h={2.5} indicatorProps={indicator} />
    </Stack>
  )
}
