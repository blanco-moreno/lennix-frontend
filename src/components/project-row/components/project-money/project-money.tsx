import { Box, Flex, Stack } from '@chakra-ui/react'
import { Wallet } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Progress, Text } from '@/components/ui'
import { ROW_PROGRESS_BAR_MIN_W, ROW_PROGRESS_BAR_W } from '@/constants'
import type { ProjectSubject } from '@/types'
import {
  clampPercentage,
  formatMoney,
  formatPercent,
  getBudgetProgressBarColor,
} from '@/utils'

import { projectRowMessages as m } from '../../project-row-messages'

/**
 * The obra's money, all of it in one cell: the budget, and how much of it is
 * gone. Beside the avance bar, "progreso" and "gastado" stack up with neither
 * saying which one is money.
 *
 * Three states, and only one of them draws a bar:
 * - no money concept at all (the dashboard's rollup row) — the cell is empty;
 * - no budget set, or a budget of zero — one sentence saying so, because a 0%
 *   bar claims the obra is on budget when nobody has said what the budget is;
 * - a real budget — the figure, the bar, and what has been spent against it.
 */
export function ProjectMoney({ project }: { project: ProjectSubject }) {
  const { budget, spent, isOverBudget, currency } = project

  if (budget === undefined) return null

  if (!budget) {
    return (
      <Text as="span" size="sm" color="muted">
        <FormattedMessage {...m.budgetUnassigned} />
      </Text>
    )
  }

  const spentPercent = spent === undefined ? null : (spent / budget) * 100

  return (
    <Stack gap={1} minW={0}>
      <Flex align="center" gap={1.5} minW={0}>
        <Box as={Wallet} boxSize={3.5} flexShrink={0} color="fg.subtle" />
        <Text as="span" size="sm" weight="semibold" color="primary">
          {formatMoney(budget, currency)}
        </Text>
      </Flex>

      {spent !== undefined && spentPercent !== null && (
        <Stack gap={0.5} minW={0}>
          <Flex align="center" gap={2} minW={0}>
            <Progress
              aria-hidden
              w={ROW_PROGRESS_BAR_W}
              minW={ROW_PROGRESS_BAR_MIN_W}
              h={1.5}
              value={clampPercentage(spentPercent)}
              indicatorProps={getBudgetProgressBarColor(
                isOverBudget ?? false,
                spentPercent,
              )}
            />
            <Text
              as="span"
              size="xs"
              weight="medium"
              color={isOverBudget ? 'overBudget' : undefined}
            >
              {formatPercent(spentPercent, 0)}
            </Text>
          </Flex>
          <Text
            as="span"
            size="xs"
            color={isOverBudget ? 'overBudget' : 'muted'}
          >
            <FormattedMessage
              {...m.spentOf}
              values={{ amount: formatMoney(spent, currency) }}
            />
          </Text>
        </Stack>
      )}
    </Stack>
  )
}
