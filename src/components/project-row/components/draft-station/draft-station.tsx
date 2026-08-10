import { Box, Flex, Stack } from '@chakra-ui/react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Text } from '@/components/ui'
import type { ReviewStep } from '@/types'

import { projectRowMessages as m } from '../../project-row-messages'

/**
 * The wizard's three stations, in wizard order. `upload` is not one of them:
 * once rows landed it is a receipt, and a draft that never got past it has
 * nothing to review — both read as sitting at the first station.
 */
const STATIONS = [
  { step: 'schedule', label: m.stationSchedule },
  { step: 'budget', label: m.stationBudget },
  { step: 'confirm', label: m.stationConfirm },
] as const

export interface DraftStationProps {
  /** The step the backend remembers; `upload` or absent means the first one. */
  step?: ReviewStep | null
}

/**
 * How far the import got — what a draft has instead of avance.
 *
 * It occupies the same track as a live obra's burn bars, so the eye finds
 * "how is this one doing" in the same place on both listings. Drawn as
 * stations rather than a percentage: a review is at a step, not at 66%.
 */
export function DraftStation({ step }: DraftStationProps) {
  const intl = useIntl()

  const index = Math.max(
    0,
    STATIONS.findIndex((station) => station.step === step),
  )
  const current = index + 1

  return (
    <Stack gap={1.5} minW={0}>
      <Flex gap={1.5} aria-hidden>
        {STATIONS.map((station, position) => (
          <Box
            key={station.step}
            flex={1}
            h={1.5}
            rounded="full"
            bg={position <= index ? 'complementary' : 'bg.muted'}
          />
        ))}
      </Flex>
      <Text as="span" size="xs" weight="medium" color="complementary">
        <FormattedMessage
          {...m.draftStep}
          values={{
            current,
            total: STATIONS.length,
            step: intl.formatMessage(STATIONS[index].label),
          }}
        />
      </Text>
    </Stack>
  )
}
