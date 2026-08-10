import { Box, Flex, Stack } from '@chakra-ui/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import { EmptyState, ErrorState, Heading, Button, Label } from '@/components'
import { Combobox } from '@/components/ui/combobox/combobox'
import { DataTable } from '@/components/ui/data-table'
import { usePermission } from '@/hooks'
import { useExpenseColumns } from '@/hooks/use-expense-columns/use-expense-columns'
import {
  useListProjectExpensesQuery,
  useDeleteExpenseMutation,
} from '@/services/expense'
import type { ProjectExpense, Task } from '@/types'
import { expenseManagementMessages as em } from '@/utils'

import { taskDetailViewMessages } from '../../task-detail-view-messages'
import { ExpenseCreateForm } from '../expense-create-form'
import { ExpenseEditForm } from '../expense-edit-form'

import { DeleteExpenseButton } from './components/delete-expense-button'
import { taskExpensesTabMessages as m } from './task-expenses-tab-messages'

interface TaskExpensesTabProps {
  task: Task
}

/**
 * One request for the whole phase: the project's expense list narrowed to this
 * task's rows — a per-subtask query fan-out would mean a variable hook count.
 */
function useAllSubtaskExpenses(projectId: string, taskId: string) {
  const {
    data: projectExpenses,
    isLoading,
    isError,
  } = useListProjectExpensesQuery({ projectId })

  const allExpenses = useMemo(
    () => (projectExpenses ?? []).filter((e) => e.taskId === taskId),
    [projectExpenses, taskId],
  )

  return { allExpenses, isLoading, isError }
}

export function TaskExpensesTab({ task }: TaskExpensesTabProps) {
  const intl = useIntl()
  const canWriteExpenses = usePermission('task.expenses.write')
  const subtasks = useMemo(() => task.subtasks ?? [], [task.subtasks])
  const { allExpenses, isLoading, isError } = useAllSubtaskExpenses(
    task.projectId,
    task.id,
  )
  const [deleteExpense] = useDeleteExpenseMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<ProjectExpense | null>(
    null,
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterSubtaskId, setFilterSubtaskId] = useState<string>('all')

  const subtaskOptions = useMemo(
    () => subtasks.map((s) => ({ id: s.id, title: s.title })),
    [subtasks],
  )

  const filteredExpenses = useMemo(
    () =>
      filterSubtaskId === 'all'
        ? allExpenses
        : allExpenses.filter((e) => e.subtaskId === filterSubtaskId),
    [allExpenses, filterSubtaskId],
  )

  const handleDelete = useCallback(
    async (expense: ProjectExpense) => {
      setDeletingId(expense.id)
      try {
        await deleteExpense({
          id: expense.id,
          subtaskId: expense.subtaskId,
          taskId: expense.taskId,
          projectId: task.projectId,
        }).unwrap()
        toast.success(intl.formatMessage(m.expensesDeleteSuccess), {
          id: m.expensesDeleteSuccess.id,
        })
      } catch {
        toast.error(intl.formatMessage(m.expensesDeleteError), {
          id: m.expensesDeleteError.id,
        })
      } finally {
        setDeletingId(null)
      }
    },
    [deleteExpense, task.projectId, intl],
  )

  const sharedColumns = useExpenseColumns()
  const columns = useMemo<ColumnDef<ProjectExpense>[]>(
    () => [
      ...sharedColumns,
      {
        id: 'actions',
        header: () => (
          <Box as="span" textAlign="right">
            <FormattedMessage {...em.columnActions} />
          </Box>
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const expense = row.original
          if (!canWriteExpenses) return null
          return (
            <Flex align="center" justify="flex-end" gap={2}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingExpense(expense)}
              >
                <FormattedMessage {...taskDetailViewMessages.edit} />
              </Button>
              <DeleteExpenseButton
                isDeleting={deletingId === expense.id}
                name={expense.description}
                onConfirm={async () => handleDelete(expense)}
              />
            </Flex>
          )
        },
      },
    ],
    [sharedColumns, deletingId, handleDelete, canWriteExpenses],
  )

  if (subtasks.length === 0) {
    return (
      <EmptyState
        title={intl.formatMessage(m.expensesNoSubtasksTitle)}
        description={intl.formatMessage(m.expensesNoSubtasksDescription)}
      />
    )
  }

  return (
    <Stack gap={4}>
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        gap="tight"
        align={{ sm: 'center' }}
        justify={{ sm: 'space-between' }}
      >
        <Heading size="h3" weight="semibold" color="primary">
          <FormattedMessage
            {...m.expensesDetailHeading}
            values={{ count: filteredExpenses.length }}
          />
        </Heading>
        <Flex align="flex-end" gap="tight">
          <Stack gap={1} width={400}>
            <Label fontSize="xs" color="fg.muted">
              <FormattedMessage {...m.expensesSubtaskFilterLabel} />
            </Label>
            <Combobox
              value={filterSubtaskId}
              onValueChange={setFilterSubtaskId}
              placeholder={intl.formatMessage(m.expensesAllSubtasks)}
              options={[
                {
                  value: 'all',
                  label: intl.formatMessage(m.expensesAllSubtasks),
                },
                ...subtaskOptions.map((sub) => ({
                  value: sub.id,
                  label: sub.title,
                })),
              ]}
            />
          </Stack>
          {canWriteExpenses && (
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Box as={Plus} boxSize={4} mr={1} />
              <FormattedMessage {...m.expensesRegisterButton} />
            </Button>
          )}
        </Flex>
      </Flex>

      {isError ? (
        <ErrorState message={<FormattedMessage {...m.expensesLoadError} />} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredExpenses}
          isLoading={isLoading}
          emptyMessage={intl.formatMessage(m.expensesTableEmpty)}
        />
      )}

      <ExpenseCreateForm
        subtasks={subtaskOptions}
        taskId={task.id}
        projectId={task.projectId}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
      <ExpenseEditForm
        expense={editingExpense}
        taskId={task.id}
        projectId={task.projectId}
        open={editingExpense !== null}
        onOpenChange={(open) => {
          if (!open) setEditingExpense(null)
        }}
      />
    </Stack>
  )
}
