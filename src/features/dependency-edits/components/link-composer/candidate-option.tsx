/**
 * One row inside the link picker: the activity, when it runs, and — when it
 * cannot be linked — why.
 *
 * The reason is text in the option itself, never a tooltip: hover reaches
 * neither a touch screen nor a screen reader, and a reader arrowing through the
 * menu hears "Hormigonado, already waits for this one, unavailable" — which is
 * the whole lesson, in audio.
 */

import { Flex } from '@chakra-ui/react'

import { Text } from '@/components'

import type { CandidateOption as Option } from './candidate-options'

export function CandidateOption({ option }: { option: Option }) {
  return (
    <Flex align="baseline" gap={3} justify="space-between" w="full" minW={0}>
      <Text size="sm" color={option.reason ? 'muted' : 'primary'} truncate>
        {option.label}
      </Text>
      <Text size="xs" color="muted" flexShrink={0}>
        {option.reason ?? option.when}
      </Text>
    </Flex>
  )
}
