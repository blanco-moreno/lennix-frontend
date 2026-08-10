import { Flex, SimpleGrid, Stack } from '@chakra-ui/react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  BudgetSummary,
  ErrorState,
  Skeleton,
  Progress,
  Text,
} from '@/components'
import { useGetProjectBudgetQuery } from '@/services/project'
import {
  formatMoney,
  formatPercent,
  clampPercentage,
  getBudgetProgressBarColor,
} from '@/utils'

import { projectBudgetPanelMessages as m } from './project-budget-panel-messages'

interface ProjectBudgetPanelProps {
  projectId: string
}

export function ProjectBudgetPanel({ projectId }: ProjectBudgetPanelProps) {
  const intl = useIntl()
  const { data: budget, isLoading, error } = useGetProjectBudgetQuery(projectId)

  if (isLoading) {
    return (
      <Stack gap="section" pt={6} aria-busy data-testid="budget-panel">
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="section">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} h={20} rounded="lg" />
          ))}
        </SimpleGrid>
        <Skeleton h={3} rounded="full" />
      </Stack>
    )
  }

  if (error || !budget) {
    return <ErrorState message={<FormattedMessage {...m.budgetPanelError} />} />
  }

  return (
    <Stack gap="section" pt={6}>
      <BudgetSummary
        budgetLabel={<FormattedMessage {...m.totalBudgetLabel} />}
        budgetValue={
          budget.budget !== null
            ? formatMoney(budget.budget)
            : intl.formatMessage(m.budgetUnassigned)
        }
        spentLabel={<FormattedMessage {...m.spentLabel} />}
        spent={budget.spent}
        remainingLabel={
          <FormattedMessage
            {...(budget.isOverBudget ? m.overbudgetLabel : m.remainingLabel)}
          />
        }
        remaining={budget.remaining}
        isOverBudget={budget.isOverBudget}
        overBudgetAlertTitle={<FormattedMessage {...m.budgetExceededTitle} />}
        overBudgetAlertBody={
          <FormattedMessage
            {...m.budgetExceededBody}
            values={{ amount: formatMoney(Math.abs(budget.remaining)) }}
          />
        }
      >
        {/* Utilization */}
        <Stack gap="tight" rounded="lg" bg="bg.subtle" p={5}>
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
              {formatMoney(budget.spent)} /{' '}
              {budget.budget !== null
                ? formatMoney(budget.budget)
                : intl.formatMessage(m.budgetNa)}
            </Text>
          </Flex>
          <Progress
            value={clampPercentage(budget.utilizationPercentage)}
            h={3}
            indicatorProps={getBudgetProgressBarColor(
              budget.isOverBudget,
              budget.utilizationPercentage,
            )}
          />
          <Text size="xs" color="muted">
            {formatPercent(budget.utilizationPercentage, 1)}{' '}
            <FormattedMessage {...m.utilizationSuffix} />
          </Text>
        </Stack>
      </BudgetSummary>
    </Stack>
  )
}
