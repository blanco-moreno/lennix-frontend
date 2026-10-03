import { HStack } from '@chakra-ui/react'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import { useFormatDate } from '@/i18n'
import type { ProjectExpense } from '@/types'
import {
  CATEGORY_LABEL,
  expenseManagementMessages as m,
  formatMoney,
  EXPENSE_CATEGORY_VARIANT,
} from '@/utils'

import { ExpenseAttachmentButton } from './components/expense-attachment-button'

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
        cell: ({ getValue }) => {
          const val = getValue<string | null>()
          return (
            <Text
              size="sm"
              weight="medium"
              color={val ? 'fg.default' : 'fg.muted'}
            >
              {val || intl.formatMessage(m.layerProjectDirect)}
            </Text>
          )
        },
      },
      {
        accessorKey: 'subtaskTitle',
        header: intl.formatMessage(m.columnSubtask),
        cell: ({ getValue }) => {
          const val = getValue<string | null>()
          return (
            <Text size="sm" color={val ? 'fg.default' : 'fg.muted'}>
              {val || '—'}
            </Text>
          )
        },
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
        id: 'document',
        header: intl.formatMessage(m.columnDocument),
        enableSorting: false,
        cell: ({ row }) => {
          const expense = row.original
          if (
            !expense.documentType &&
            !expense.documentNumber &&
            !expense.hasAttachment
          ) {
            return <Text color="fg.muted">—</Text>
          }
          const docTypeLabel =
            expense.documentType === 'invoice'
              ? intl.formatMessage(m.documentTypeInvoice)
              : expense.documentType === 'receipt'
                ? intl.formatMessage(m.documentTypeReceipt)
                : expense.documentType === 'purchase_order'
                  ? intl.formatMessage(m.documentTypePurchaseOrder)
                  : ''
          const label = [docTypeLabel, expense.documentNumber]
            .filter(Boolean)
            .join(' ')

          return (
            <HStack gap={2}>
              {label ? <Badge variant="outline">{label}</Badge> : null}
              {expense.hasAttachment && (
                <ExpenseAttachmentButton expense={expense} />
              )}
            </HStack>
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
