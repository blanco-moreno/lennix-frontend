import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Badge, Text } from '@/components'
import { useFormatDate } from '@/i18n'
import type { ProjectExpense } from '@/types'
import {
  CATEGORY_LABEL,
  expenseManagementMessages as m,
  formatMoney,
  EXPENSE_CATEGORY_VARIANT,
} from '@/utils'

/**
 * The expense-table columns shared by the project and task expense tabs.
 * Callers append surface-specific columns (e.g. a row-actions column).
 */
export function useExpenseColumns(): ColumnDef<ProjectExpense>[] {
  const intl = useIntl()
  const formatDate = useFormatDate()

  return useMemo<ColumnDef<ProjectExpense>[]>(
    () => [
      {
        accessorKey: 'taskTitle',
        header: intl.formatMessage(m.columnTask),
        cell: ({ getValue }) => (
          <Text size="sm" weight="medium">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: 'subtaskTitle',
        header: intl.formatMessage(m.columnSubtask),
      },
      {
        accessorKey: 'description',
        header: intl.formatMessage(m.columnDescription),
      },
      {
        accessorKey: 'amount',
        header: intl.formatMessage(m.columnAmount),
        cell: ({ getValue }) => formatMoney(getValue<number>()),
      },
      {
        accessorKey: 'category',
        header: intl.formatMessage(m.columnCategory),
        enableSorting: false,
        cell: ({ getValue }) => {
          const category = getValue<string>()
          const descriptor =
            CATEGORY_LABEL[category as keyof typeof CATEGORY_LABEL]
          return (
            <Badge variant={EXPENSE_CATEGORY_VARIANT[category] ?? 'default'}>
              {descriptor ? intl.formatMessage(descriptor) : category}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'expenseDate',
        header: intl.formatMessage(m.columnDate),
        cell: ({ getValue }) => formatDate(getValue<string>()),
      },
    ],
    [intl, formatDate],
  )
}
