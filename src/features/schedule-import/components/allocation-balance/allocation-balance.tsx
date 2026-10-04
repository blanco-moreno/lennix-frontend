/**
 * The budget against its split: budget, assigned, and what is left or over.
 * The budget and confirm steps render this same balance from the same
 * `AllocationSummary`, so the numbers on both are the ones that go live.
 */

import { Grid, Stack } from '@chakra-ui/react'
import {
  AlertTriangle,
  Coins,
  PiggyBank,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import { useIntl } from 'react-intl'

import { Alert, Progress, Text } from '@/components'
import { StatCard } from '@/components/ui/stat-card'
import { formatMoney } from '@/utils'

import type { AllocationSummary } from '../../project-details-draft'

import { allocationBalanceMessages as m } from './allocation-balance-messages'

export interface AllocationBalanceProps {
  allocation: AllocationSummary
}

export function AllocationBalance({ allocation }: AllocationBalanceProps) {
  const intl = useIntl()
  const { assigned, unassigned, overrun } = allocation
  const budget = unassigned === null ? null : assigned + unassigned

  return (
    <Stack gap="tight" data-testid="allocation-balance">
      <Grid
        gap={4}
        templateColumns={{ base: '1fr', md: 'repeat(3, minmax(0, 1fr))' }}
      >
        <StatCard
          icon={Wallet}
          semantic={budget === null ? 'default' : 'success'}
          label={intl.formatMessage(m.budget)}
          value={
            budget === null
              ? intl.formatMessage(m.noBudget)
              : formatMoney(budget)
          }
        />
        <StatCard
          icon={PiggyBank}
          semantic="info"
          label={intl.formatMessage(m.assigned)}
          value={formatMoney(assigned)}
        />
        {unassigned !== null && (
          <StatCard
            icon={overrun ? TrendingDown : Coins}
            semantic={overrun ? 'overBudget' : 'complementary'}
            label={intl.formatMessage(overrun ? m.overrun : m.unassigned)}
            value={
              <Text
                as="span"
                weight="semibold"
                size="lg"
                color={overrun ? 'overBudget' : undefined}
                data-testid="allocation-remainder"
              >
                {formatMoney(Math.abs(unassigned))}
              </Text>
            }
          />
        )}
      </Grid>

      {budget !== null && budget > 0 && (
        <Progress
          value={Math.min(100, (assigned / budget) * 100)}
          h={2}
          aria-label={intl.formatMessage(m.assigned)}
          indicatorProps={overrun ? { bg: 'overBudget' } : undefined}
        />
      )}

      {overrun && unassigned !== null && (
        <Alert variant="overBudget" icon={AlertTriangle}>
          {intl.formatMessage(m.overrunNote, {
            excess: formatMoney(-unassigned),
          })}
        </Alert>
      )}

      {budget === null && (
        <Text size="xs" color="muted">
          {intl.formatMessage(m.noBudgetNote)}
        </Text>
      )}
    </Stack>
  )
}
