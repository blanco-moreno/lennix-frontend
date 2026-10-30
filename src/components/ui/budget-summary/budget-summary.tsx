import { Box, Flex, SimpleGrid } from '@chakra-ui/react'
import {
  AlertTriangle,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { ReactNode } from 'react'

import {
  formatMoney,
  getBudgetRemainingIconContainerColor,
  getBudgetRemainingTextColor,
  getBudgetSpentIconContainerColor,
  getBudgetSpentTextColor,
} from '@/utils'

import { Alert } from '../alert'
import { Text } from '../text'

interface BudgetSummaryProps {
  budgetLabel: ReactNode
  /** Already formatted by the caller — a money string or an "unassigned" fallback. */
  budgetValue: ReactNode
  spentLabel: ReactNode
  spent: number
  /** The caller picks the over-budget vs. remaining/available variant. */
  remainingLabel: ReactNode
  remaining: number
  /** ISO 4217 code the amounts are in (`BUD-10`); USD when absent. */
  currency?: string
  isOverBudget: boolean
  overBudgetAlertTitle: ReactNode
  overBudgetAlertBody: ReactNode
  /** Surface-specific sections rendered between the tiles and the alert. */
  children?: ReactNode
}

/**
 * The three budget stat tiles (budget / spent / remaining) plus the
 * over-budget alert shared by the task budget tab and the project budget
 * panel. Purely presentational — the callers fetch and format.
 */
export function BudgetSummary({
  budgetLabel,
  budgetValue,
  spentLabel,
  spent,
  remainingLabel,
  remaining,
  currency,
  isOverBudget,
  overBudgetAlertTitle,
  overBudgetAlertBody,
  children,
}: BudgetSummaryProps) {
  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="tight">
        <Flex align="center" gap="tight" rounded="lg" p={4} bg="info/10">
          <Box rounded="lg" p={2.5} bg="info/15">
            <Box as={DollarSign} boxSize={5} color="info" />
          </Box>
          <Box>
            <Text size="xs" color="muted">
              {budgetLabel}
            </Text>
            <Text size="lg" weight="bold" color="primary">
              {budgetValue}
            </Text>
          </Box>
        </Flex>

        <Flex
          align="center"
          gap="tight"
          rounded="lg"
          p="cardSm"
          bg={isOverBudget ? 'overBudget/10' : 'warning/10'}
        >
          <Box
            rounded="lg"
            p={2.5}
            {...getBudgetSpentIconContainerColor(isOverBudget)}
          >
            <Box
              as={TrendingDown}
              boxSize={5}
              {...getBudgetSpentTextColor(isOverBudget)}
            />
          </Box>
          <Box>
            <Text size="xs" color="muted">
              {spentLabel}
            </Text>
            <Text
              size="lg"
              weight="bold"
              {...getBudgetSpentTextColor(isOverBudget)}
            >
              {formatMoney(spent, currency)}
            </Text>
          </Box>
        </Flex>

        <Flex
          align="center"
          gap="tight"
          rounded="lg"
          p="cardSm"
          bg={isOverBudget ? 'overBudget/10' : 'success/10'}
        >
          <Box
            rounded="lg"
            p={2.5}
            {...getBudgetRemainingIconContainerColor(isOverBudget)}
          >
            <Box
              as={TrendingUp}
              boxSize={5}
              {...getBudgetRemainingTextColor(isOverBudget)}
            />
          </Box>
          <Box>
            <Text size="xs" color="muted">
              {remainingLabel}
            </Text>
            <Text
              size="lg"
              weight="bold"
              {...getBudgetRemainingTextColor(isOverBudget)}
            >
              {formatMoney(Math.abs(remaining), currency)}
            </Text>
          </Box>
        </Flex>
      </SimpleGrid>

      {children}

      {isOverBudget && (
        <Alert
          icon={AlertTriangle}
          iconProps={{ color: 'overBudget' }}
          borderColor="overBudget/30"
          bg="overBudget/5"
        >
          <Text as="strong" color="overBudget">
            {overBudgetAlertTitle}
          </Text>
          <Text size="sm" mt={1}>
            {overBudgetAlertBody}
          </Text>
        </Alert>
      )}
    </>
  )
}
