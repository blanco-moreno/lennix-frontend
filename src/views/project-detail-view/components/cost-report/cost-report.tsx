import { Box, Flex, Stack } from '@chakra-ui/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Badge, EmptyState, ErrorState, Heading, Text } from '@/components'
import { DataTable } from '@/components/ui/data-table'
import { useGetCostReportQuery } from '@/services/expense'
import type { BudgetVariance } from '@/types'
import {
  formatMoney,
  formatPercent,
  EXPENSE_CATEGORY_VARIANT,
  expenseManagementMessages as m,
} from '@/utils'

interface CostReportProps {
  projectId: string
}

export function CostReport({ projectId }: CostReportProps) {
  const intl = useIntl()
  const { data: report, isLoading, isError } = useGetCostReportQuery(projectId)

  const varianceColumns = useMemo<ColumnDef<BudgetVariance>[]>(
    () => [
      {
        accessorKey: 'entityName',
        header: intl.formatMessage(m.columnTask),
        cell: ({ getValue }) => <Text size="sm">{getValue<string>()}</Text>,
      },
      {
        accessorKey: 'budget',
        header: intl.formatMessage(m.columnBudget),
        cell: ({ getValue }) => {
          const v = getValue<number | null>()
          return v === null ? intl.formatMessage(m.budgetNa) : formatMoney(v)
        },
      },
      {
        accessorKey: 'spent',
        header: intl.formatMessage(m.columnSpent),
        cell: ({ getValue }) => formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'remaining',
        header: intl.formatMessage(m.columnRemaining),
        cell: ({ getValue }) => formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'variancePercentage',
        header: intl.formatMessage(m.columnVariance),
        cell: ({ row }) => (
          <Text
            size="sm"
            color={row.original.isOverBudget ? 'overBudget' : 'default'}
          >
            {formatPercent(Math.abs(row.original.variancePercentage), 1)}
          </Text>
        ),
      },
      {
        id: 'status',
        header: intl.formatMessage(m.columnStatus),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isOverBudget ? (
            <Badge variant="overBudget-soft">
              <FormattedMessage {...m.statusOverBudget} />
            </Badge>
          ) : (
            <Badge variant="status-active">
              <FormattedMessage {...m.statusInRange} />
            </Badge>
          ),
      },
    ],
    [intl],
  )

  if (isLoading) {
    return (
      <DataTable
        columns={varianceColumns}
        data={[]}
        isLoading
        emptyMessage={intl.formatMessage(m.taskVariancesEmpty)}
      />
    )
  }

  if (isError || !report) {
    return <ErrorState message={<FormattedMessage {...m.costError} />} />
  }

  return (
    <Stack gap="section">
      {/* Category Breakdown */}
      <Heading size="h3" weight="semibold" color="primary">
        <FormattedMessage {...m.categoryBreakdown} />
      </Heading>
      <Box rounded="lg" bg="bg.subtle" p="card">
        {Object.keys(report.categoryBreakdown).length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={intl.formatMessage(m.categoryBreakdownEmpty)}
          />
        ) : (
          <Flex wrap="wrap" gap="tight">
            {Object.entries(report.categoryBreakdown).map(
              ([category, amount]) => (
                <Badge
                  key={category}
                  variant={EXPENSE_CATEGORY_VARIANT[category] ?? 'default'}
                  px={3}
                  py={1.5}
                  fontSize="sm"
                >
                  {category}: {formatMoney(amount)}
                </Badge>
              ),
            )}
          </Flex>
        )}
      </Box>

      {/* Task Variances */}
      <Heading size="h3" weight="semibold" color="primary">
        <FormattedMessage {...m.taskVariances} />
      </Heading>
      {/* No outer guard: the table owns its own empty state, and a second one
          in front of it only meant the same sentence in two shapes. */}
      <DataTable
        columns={varianceColumns}
        data={report.taskVariances}
        emptyMessage={intl.formatMessage(m.taskVariancesEmpty)}
      />
    </Stack>
  )
}
