import { Box, Flex, SimpleGrid, Stack } from '@chakra-ui/react'
import { BarChart3 } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Badge, BudgetSummary, Heading, Text } from '@/components'
import { useGetTaskVarianceQuery } from '@/services/expense'
import type { Task } from '@/types'
import {
  formatMoney,
  calculateBudgetMetrics,
  formatPercent,
  getBudgetVarianceTextColor,
  getBudgetVarianceBadgeColor,
  getBudgetProgressBarColor,
} from '@/utils'

import { taskDetailViewMessages } from '../../task-detail-view-messages'

import { taskBudgetTabMessages as m } from './task-budget-tab-messages'

interface TaskBudgetTabProps {
  task: Task
}

export function TaskBudgetTab({ task }: TaskBudgetTabProps) {
  const intl = useIntl()
  const { budgetRemaining, budgetPercentage, isOverBudget } =
    calculateBudgetMetrics(task.budget ?? 0, task.spent)
  const { data: variance } = useGetTaskVarianceQuery(task.id)

  return (
    <Stack gap="section">
      <Heading size="h3" weight="semibold" color="primary">
        <FormattedMessage {...m.budgetSummaryHeading} />
      </Heading>

      <BudgetSummary
        budgetLabel={<FormattedMessage {...m.assignedBudgetLabel} />}
        budgetValue={formatMoney(task.budget ?? 0)}
        spentLabel={<FormattedMessage {...m.spentLabel} />}
        spent={task.spent}
        remainingLabel={
          <FormattedMessage
            {...(isOverBudget ? m.overbudgetLabel : m.availableLabel)}
          />
        }
        remaining={budgetRemaining}
        isOverBudget={isOverBudget}
        overBudgetAlertTitle={<FormattedMessage {...m.budgetExceededTitle} />}
        overBudgetAlertBody={
          <FormattedMessage
            {...m.budgetExceededBody}
            values={{ amount: formatMoney(Math.abs(budgetRemaining)) }}
          />
        }
      >
        {/* Utilization + Variance in a 2-col layout */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
          {/* Utilization */}
          <Stack gap="tight" rounded="lg" bg="bg.subtle" p="card">
            <Flex
              align="center"
              justify="space-between"
              fontSize="sm"
              wrap="wrap"
              gap={2}
            >
              <Text size="sm" weight="medium" color="primary">
                <FormattedMessage {...m.utilizationLabel} />
              </Text>
              <Text as="span" color="muted">
                {formatMoney(task.spent)} / {formatMoney(task.budget ?? 0)}
              </Text>
            </Flex>
            <Box h={3} w="full" rounded="full" bg="gray.200">
              <Box
                h={3}
                rounded="full"
                transition="all 0.3s"
                {...getBudgetProgressBarColor(isOverBudget, budgetPercentage)}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </Box>
            <Text size="xs" color="muted">
              {formatPercent(budgetPercentage, 1)}
            </Text>
          </Stack>

          {/* Variance */}
          {variance && (
            <Stack gap="tight" rounded="lg" bg="bg.subtle" p="card">
              <Flex align="center" gap={2}>
                <Box as={BarChart3} boxSize={4} color="complementary" />
                <Text size="sm" weight="medium" color="primary">
                  <FormattedMessage {...m.varianceHeading} />
                </Text>
              </Flex>
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap="tight">
                <Box>
                  <Text size="xs" color="muted">
                    <FormattedMessage {...m.varianceLabel} />
                  </Text>
                  <Text
                    size="sm"
                    weight="bold"
                    {...getBudgetVarianceTextColor(variance.isOverBudget)}
                  >
                    {formatPercent(Math.abs(variance.variancePercentage), 1)}
                  </Text>
                </Box>
                <Box>
                  <Text size="xs" color="muted">
                    <FormattedMessage {...taskDetailViewMessages.statusLabel} />
                  </Text>
                  <Badge
                    {...getBudgetVarianceBadgeColor(variance.isOverBudget)}
                  >
                    {intl.formatMessage(
                      variance.isOverBudget
                        ? m.varianceStatusOverbudget
                        : m.varianceStatusOnBudget,
                    )}
                  </Badge>
                </Box>
              </SimpleGrid>
            </Stack>
          )}
        </SimpleGrid>
      </BudgetSummary>
    </Stack>
  )
}
