import { Flex, Stack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { ErrorState, Heading, Label, Select } from '@/components'
import { Combobox } from '@/components/ui/combobox/combobox'
import { DataTable } from '@/components/ui/data-table'
import { useExpenseColumns } from '@/hooks/use-expense-columns/use-expense-columns'
import { useListProjectExpensesQuery } from '@/services/expense'
import { expenseManagementMessages as em } from '@/utils'

import {
  buildSubtaskOptions,
  buildTaskOptions,
  filterExpenses,
} from './expense-filters'
import { projectExpensesTabMessages as m } from './project-expenses-tab-messages'

interface ProjectExpensesTabProps {
  projectId: string
}

export function ProjectExpensesTab({ projectId }: ProjectExpensesTabProps) {
  const intl = useIntl()
  const [filterTaskId, setFilterTaskId] = useState('all')
  const [filterSubtaskId, setFilterSubtaskId] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const {
    data: expenses = [],
    isLoading,
    error,
  } = useListProjectExpensesQuery({
    projectId,
    ...(filterCategory !== 'all' && { category: filterCategory }),
  })

  const taskOptions = useMemo(() => buildTaskOptions(expenses), [expenses])

  const subtaskOptions = useMemo(
    () => buildSubtaskOptions(expenses, filterTaskId),
    [expenses, filterTaskId],
  )

  const filteredExpenses = useMemo(
    () => filterExpenses(expenses, filterTaskId, filterSubtaskId),
    [expenses, filterTaskId, filterSubtaskId],
  )

  const handleTaskFilterChange = (value: string) => {
    setFilterTaskId(value)
    setFilterSubtaskId('all')
  }

  const columns = useExpenseColumns()

  return (
    <Stack gap={4}>
      {/* Filters + Table Header */}
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        gap="tight"
        align={{ base: 'stretch', sm: 'center' }}
        justify={{ base: 'flex-start', sm: 'space-between' }}
      >
        <Heading size="h3" weight="semibold" color="primary">
          <FormattedMessage
            {...m.expensesDetailHeading}
            values={{ count: filteredExpenses.length }}
          />
        </Heading>
        <Flex wrap="wrap" align="end" gap="tight">
          <Stack gap={1}>
            <Label fontSize="xs" color="fg.muted">
              <FormattedMessage {...m.filterTaskLabel} />
            </Label>
            <Combobox
              value={filterTaskId}
              onValueChange={handleTaskFilterChange}
              width="auto"
              placeholder={intl.formatMessage(m.filterAllTasks)}
              options={[
                {
                  value: 'all',
                  label: intl.formatMessage(m.filterAllTasks),
                },
                ...taskOptions.map((t) => ({ value: t.id, label: t.title })),
              ]}
            />
          </Stack>
          <Stack gap={1}>
            <Label fontSize="xs" color="fg.muted">
              <FormattedMessage {...m.filterSubtaskLabel} />
            </Label>
            <Combobox
              value={filterSubtaskId}
              onValueChange={setFilterSubtaskId}
              width="auto"
              placeholder={intl.formatMessage(m.filterAllSubtasks)}
              options={[
                {
                  value: 'all',
                  label: intl.formatMessage(m.filterAllSubtasks),
                },
                ...subtaskOptions.map((s) => ({ value: s.id, label: s.title })),
              ]}
            />
          </Stack>
          <Stack gap={1}>
            <Label fontSize="xs" color="fg.muted">
              <FormattedMessage {...m.filterCategoryLabel} />
            </Label>
            <Select
              value={filterCategory}
              onChange={setFilterCategory}
              placeholder={intl.formatMessage(m.filterAllCategories)}
              options={[
                {
                  value: 'all',
                  label: intl.formatMessage(m.filterAllCategories),
                },
                { value: 'labor', label: intl.formatMessage(em.categoryLabor) },
                {
                  value: 'materials',
                  label: intl.formatMessage(em.categoryMaterials),
                },
                {
                  value: 'equipment',
                  label: intl.formatMessage(em.categoryEquipment),
                },
                {
                  value: 'subcontractor',
                  label: intl.formatMessage(em.categorySubcontractor),
                },
                { value: 'other', label: intl.formatMessage(em.categoryOther) },
              ]}
            />
          </Stack>
        </Flex>
      </Flex>

      {/* Table */}
      {error ? (
        <ErrorState message={<FormattedMessage {...m.expensesLoadError} />} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredExpenses}
          isLoading={isLoading}
          emptyMessage={intl.formatMessage(m.noExpensesFound)}
        />
      )}
    </Stack>
  )
}
