/**
 * A plan ceiling, made legible *before* it bites.
 *
 * Generalised out of the Borradores home, which had the only one: the same bar
 * now reads projects and team seats, off the same `usePlanLimit` verdict the
 * gated buttons use — so the number under the bar and the number in the
 * blocked button's tooltip can never disagree.
 */

import { Flex, Stack } from '@chakra-ui/react'
import { AlertTriangle } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Alert, Card, Progress, Text } from '@/components'
import { usePlanLimit, type PlanLimitResource } from '@/hooks'

import {
  PLAN_METER_COPY,
  planUsageMeterMessages as m,
} from './plan-usage-meter-messages'

export interface PlanUsageMeterProps {
  resource: PlanLimitResource
}

export function PlanUsageMeter({ resource }: PlanUsageMeterProps) {
  const { isLoading, isAtLimit, used, max } = usePlanLimit(resource)
  const copy = PLAN_METER_COPY[resource]

  // Nothing to be transparent about yet — and a bar that pops in at zero and
  // jumps reads worse than one that arrives filled.
  //
  // `max === null` is Enterprise: no ceiling, so there is no bar to draw. A
  // meter that can never fill is a decoration that asks the user to worry.
  if (isLoading || max === null) return null

  const remaining = Math.max(max - used, 0)

  return (
    <Card size="compact" data-testid={`plan-usage-meter-${resource}`}>
      <Stack gap="tight">
        <Flex align="center" justify="space-between" gap={4} wrap="wrap">
          <Text size="sm" weight="medium" color="primary">
            <FormattedMessage {...m[copy.label]} />
          </Text>
          <Text size="sm" color="muted">
            <FormattedMessage
              {...m.usage}
              values={{ current: used, limit: max }}
            />
          </Text>
        </Flex>

        <Progress
          value={Math.min((used / max) * 100, 100)}
          h={2}
          indicatorProps={{ bg: isAtLimit ? 'overBudget' : 'complementary' }}
        />

        {isAtLimit ? (
          <Alert variant="overBudget" icon={AlertTriangle}>
            <FormattedMessage {...m[copy.full]} values={{ limit: max }} />
          </Alert>
        ) : (
          <Text size="xs" color="muted">
            <FormattedMessage
              {...m[copy.remaining]}
              values={{ count: remaining }}
            />
          </Text>
        )}
      </Stack>
    </Card>
  )
}
