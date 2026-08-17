/**
 * A plan ceiling, made legible *before* it bites.
 *
 * One bar for every metered resource — projects, drafts, team seats, monthly
 * AI requests — off the same `usePlanLimit` verdict the gated buttons use, so
 * the number under the bar and the number in the blocked button's tooltip can
 * never disagree. From 80% of the cap the copy turns amber.
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
  /**
   * Render the resource even when it has no ceiling, as its count plus a
   * "no limit" label and no bar. For the settings section, where the whole
   * point is the complete picture; contextual placements leave it off.
   */
  showUnlimited?: boolean
}

export function PlanUsageMeter({
  resource,
  showUnlimited = false,
}: PlanUsageMeterProps) {
  const { isLoading, isAtLimit, used, max } = usePlanLimit(resource)
  const copy = PLAN_METER_COPY[resource]

  // Nothing to be transparent about yet — and a bar that pops in at zero and
  // jumps reads worse than one that arrives filled.
  if (isLoading) return null

  // `max === null` is no ceiling, so there is no bar to draw. Beside an action
  // a meter that can never fill is a decoration that asks the user to worry;
  // in settings the count itself is the answer.
  if (max === null) {
    if (!showUnlimited) return null

    return (
      <Card size="compact" data-testid={`plan-usage-meter-${resource}`}>
        <Flex align="center" justify="space-between" gap={4} wrap="wrap">
          <Text size="sm" weight="medium" color="primary">
            <FormattedMessage {...m[copy.label]} />
          </Text>
          <Text size="sm" color="muted">
            {used} · <FormattedMessage {...m.noLimit} />
          </Text>
        </Flex>
      </Card>
    )
  }

  const remaining = Math.max(max - used, 0)
  const isNearLimit = !isAtLimit && max > 0 && used / max >= 0.8

  return (
    <Card size="compact" data-testid={`plan-usage-meter-${resource}`}>
      <Stack gap="tight">
        <Flex align="center" justify="space-between" gap={4} wrap="wrap">
          <Text size="sm" weight="medium" color="primary">
            <FormattedMessage {...m[copy.label]} />
          </Text>
          <Text size="sm" color={isNearLimit ? 'warning' : 'muted'}>
            <FormattedMessage
              {...m.usage}
              values={{ current: used, limit: max }}
            />
          </Text>
        </Flex>

        <Progress
          value={Math.min((used / max) * 100, 100)}
          h={2}
          indicatorProps={{
            bg: isAtLimit
              ? 'overBudget'
              : isNearLimit
                ? 'warning'
                : 'complementary',
          }}
        />

        {isAtLimit ? (
          <Alert variant="overBudget" icon={AlertTriangle}>
            <FormattedMessage {...m[copy.full]} values={{ limit: max }} />
          </Alert>
        ) : (
          <Text size="xs" color={isNearLimit ? 'warning' : 'muted'}>
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
