import { Box, Flex, SimpleGrid, Stack, chakra } from '@chakra-ui/react'
import { useIntl, type MessageDescriptor } from 'react-intl'

import { Heading, Text } from '@/components'
import {
  RISK_LEVELS,
  riskScore,
  riskSeverity,
  type Risk,
  type RiskLevel,
  type RiskSeverity,
} from '@/types'

import { riskRegisterMessages as m } from '../../risk-register-messages'

export interface RiskMatrixCell {
  probability: RiskLevel
  impact: RiskLevel
}

interface RiskMatrixProps {
  risks: Risk[]
  selected: RiskMatrixCell | null
  onSelect: (cell: RiskMatrixCell | null) => void
}

/**
 * Tone per severity band. Three tones, not nine: the point of a 3×3 is that a
 * cell tells you what to do at a glance, and nine shades of red tell you
 * nothing. The tokens are the same ones every other severity surface uses.
 */
const SEVERITY_TONE: Record<
  RiskSeverity,
  { bg: string; border: string; color: string }
> = {
  low: { bg: 'success/10', border: 'success/20', color: 'success' },
  medium: { bg: 'warning/10', border: 'warning/20', color: 'warning' },
  high: {
    bg: 'critical/10',
    border: 'critical/20',
    color: 'critical',
  },
}

const LEVEL_LABEL: Record<RiskLevel, MessageDescriptor> = {
  low: m.levelLow,
  medium: m.levelMedium,
  high: m.levelHigh,
}

const AXIS_LABEL_WIDTH = '5rem'

/**
 * The 3×3 probability × impact matrix.
 *
 * Probability runs bottom-to-top and impact left-to-right, the orientation
 * every PMI-shaped register uses, so a contractor reading it does not have to
 * re-learn the grid. A cell is a filter: clicking it narrows the list beneath
 * to the risks that live in it, clicking again clears.
 */
export function RiskMatrix({ risks, selected, onSelect }: RiskMatrixProps) {
  const intl = useIntl()

  const countFor = (probability: RiskLevel, impact: RiskLevel) =>
    risks.filter(
      (risk) => risk.probability === probability && risk.impact === impact,
    ).length

  // Top row = highest probability.
  const rows = [...RISK_LEVELS].slice().reverse()

  return (
    <Stack gap="tight">
      <Heading size="h3" weight="medium" color="primary">
        {intl.formatMessage(m.matrixTitle)}
      </Heading>

      <Flex gap="tight" align="stretch">
        <Flex align="center" justify="center" width="1.5rem">
          <Text
            size="xs"
            color="muted"
            writingMode="vertical-rl"
            transform="rotate(180deg)"
          >
            {intl.formatMessage(m.axisProbability)}
          </Text>
        </Flex>

        <Stack flex={1} gap={2}>
          {rows.map((probability) => (
            <Flex key={probability} gap={2} align="stretch">
              <Flex width={AXIS_LABEL_WIDTH} align="center" justify="end">
                <Text size="xs" color="muted">
                  {intl.formatMessage(LEVEL_LABEL[probability])}
                </Text>
              </Flex>
              <SimpleGrid columns={3} gap={2} flex={1}>
                {RISK_LEVELS.map((impact) => {
                  const count = countFor(probability, impact)
                  const tone =
                    SEVERITY_TONE[riskSeverity(riskScore(probability, impact))]
                  const isSelected =
                    selected?.probability === probability &&
                    selected?.impact === impact
                  return (
                    <chakra.button
                      key={impact}
                      type="button"
                      onClick={() =>
                        onSelect(isSelected ? null : { probability, impact })
                      }
                      aria-pressed={isSelected}
                      aria-label={intl.formatMessage(m.cellLabel, {
                        count,
                        probability: intl.formatMessage(
                          LEVEL_LABEL[probability],
                        ),
                        impact: intl.formatMessage(LEVEL_LABEL[impact]),
                      })}
                      // The count is the cell's whole content: centred, not
                      // parked in a corner. A `Text` is block-level, so the
                      // button has to do the centring itself.
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      rounded="lg"
                      borderWidth={isSelected ? '2px' : '1px'}
                      borderColor={isSelected ? tone.color : tone.border}
                      bg={tone.bg}
                      py={5}
                      _hover={{ borderColor: tone.color }}
                    >
                      <Text size="lg" weight="semibold" color={tone.color}>
                        {count}
                      </Text>
                    </chakra.button>
                  )
                })}
              </SimpleGrid>
            </Flex>
          ))}

          <Flex gap={2}>
            <Box width={AXIS_LABEL_WIDTH} />
            <SimpleGrid columns={3} gap={2} flex={1}>
              {RISK_LEVELS.map((impact) => (
                <Flex key={impact} justify="center">
                  <Text size="xs" color="muted">
                    {intl.formatMessage(LEVEL_LABEL[impact])}
                  </Text>
                </Flex>
              ))}
            </SimpleGrid>
          </Flex>

          <Flex gap={2}>
            <Box width={AXIS_LABEL_WIDTH} />
            <Flex flex={1} justify="center">
              <Text size="xs" color="muted">
                {intl.formatMessage(m.axisImpact)}
              </Text>
            </Flex>
          </Flex>
        </Stack>
      </Flex>
    </Stack>
  )
}
