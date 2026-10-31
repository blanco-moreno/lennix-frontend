import { Box, Flex, Grid, HStack, Stack } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Badge,
  Button,
  ConfirmActionButton,
  ErrorState,
  Heading,
  Label,
  Select,
  Skeleton,
  Text,
  commonMessages,
} from '@/components'
import { CurrencyInput } from '@/components/ui/currency-input'
import { usePermission, useProjectCurrency } from '@/hooks'
import type { ApiError } from '@/services'
import {
  useGetIndirectBudgetQuery,
  useRemoveIndirectBudgetLineMutation,
  useSetIndirectBudgetLineMutation,
} from '@/services/project'
import {
  INDIRECT_CATEGORIES,
  type IndirectBudgetLine,
  type IndirectCategory,
} from '@/types'
import { indirectCategoryMessages, serializeMoneyForApi } from '@/utils'

import { indirectBudgetPanelMessages as m } from './indirect-budget-panel-messages'

/** Line · budget · spent · actions; the actions column collapses for readers. */
const LINE_COLUMNS = {
  base: 'minmax(0, 1fr) auto',
  md: 'minmax(0, 1fr) 10rem 10rem 6rem',
}

export interface IndirectBudgetPanelProps {
  projectId: string
}

/**
 * The obra's overheads (gastos generales, ms-bk `BUD-11`): one line per
 * category, sharing the wallet with the phases (`BUD-2`), each with its own
 * spend and over-budget alert. Leadership (`budget.edit.direct`) sets and
 * removes lines; everyone on the obra reads them.
 */
export function IndirectBudgetPanel({ projectId }: IndirectBudgetPanelProps) {
  const intl = useIntl()
  const canEdit = usePermission('budget.edit.direct')
  const { currency, formatMoney } = useProjectCurrency(projectId)
  const { data, isLoading, isError } = useGetIndirectBudgetQuery(projectId)
  const [setLine, { isLoading: isSaving }] = useSetIndirectBudgetLineMutation()
  const [removeLine] = useRemoveIndirectBudgetLineMutation()
  const [editing, setEditing] = useState<IndirectCategory | null>(null)
  const [draft, setDraft] = useState('')
  const [newCategory, setNewCategory] = useState<IndirectCategory | ''>('')
  const [newAmount, setNewAmount] = useState('')

  const label = (category: IndirectCategory) =>
    intl.formatMessage(indirectCategoryMessages[category])

  const fail = (error: unknown) => {
    const status = (error as ApiError).status
    const message =
      status === 400
        ? m.overdrawError
        : status === 409
          ? m.inUseError
          : m.genericError
    toast.error(intl.formatMessage(message), { id: message.id })
  }

  const save = async (category: IndirectCategory, amount: string) => {
    try {
      await setLine({
        projectId,
        category,
        body: { amount: serializeMoneyForApi(amount) },
      }).unwrap()
      toast.success(intl.formatMessage(m.saveSuccess), { id: m.saveSuccess.id })
      return true
    } catch (error) {
      fail(error)
      return false
    }
  }

  const remove = async (category: IndirectCategory) => {
    try {
      await removeLine({ projectId, category }).unwrap()
      toast.success(intl.formatMessage(m.removeSuccess), {
        id: m.removeSuccess.id,
      })
    } catch (error) {
      fail(error)
    }
  }

  if (isLoading) {
    return <Skeleton h={24} rounded="lg" data-testid="indirect-budget-panel" />
  }
  if (isError || !data) {
    return <ErrorState message={<FormattedMessage {...m.loadError} />} />
  }

  const used = new Set(data.lines.map((line) => line.category))
  const available = INDIRECT_CATEGORIES.filter((c) => !used.has(c))

  const row = (line: IndirectBudgetLine) => {
    const isEditing = editing === line.category
    return (
      <Grid
        key={line.category}
        templateColumns={LINE_COLUMNS}
        alignItems="center"
        columnGap={4}
        rowGap={1}
        px={4}
        py={2.5}
        borderTopWidth="1px"
        borderColor="border.muted"
        data-testid={`indirect-line-${line.category}`}
      >
        <HStack gap={2} minW={0}>
          <Text size="sm" weight="medium" truncate>
            {label(line.category)}
          </Text>
          {line.isOverBudget && (
            <Badge variant="overBudget">
              <FormattedMessage {...m.overBudget} />
            </Badge>
          )}
        </HStack>
        {isEditing ? (
          <CurrencyInput
            aria-label={intl.formatMessage(m.amountLabel)}
            currency={currency}
            value={draft}
            onValueChange={(details) => setDraft(details.value)}
          />
        ) : (
          <Text size="sm" textAlign={{ md: 'right' }}>
            {formatMoney(line.amount)}
          </Text>
        )}
        <Text
          size="sm"
          textAlign={{ md: 'right' }}
          color={line.isOverBudget ? 'overBudget' : 'muted'}
          display={{ base: 'none', md: 'block' }}
        >
          {formatMoney(line.spent)}
        </Text>
        {canEdit && (
          <HStack
            gap={1}
            justify="flex-end"
            gridColumn={{ base: '1 / -1', md: 'auto' }}
          >
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  disabled={draft === '' || isSaving}
                  onClick={async () => {
                    if (await save(line.category, draft)) setEditing(null)
                  }}
                >
                  <FormattedMessage {...commonMessages.save} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                >
                  <FormattedMessage {...commonMessages.cancel} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={intl.formatMessage(m.edit, {
                    line: label(line.category),
                  })}
                  onClick={() => {
                    setEditing(line.category)
                    setDraft(String(line.amount))
                  }}
                >
                  <Pencil size={14} />
                </Button>
                <ConfirmActionButton
                  aria-label={intl.formatMessage(m.remove, {
                    line: label(line.category),
                  })}
                  title={intl.formatMessage(m.removeTitle, {
                    line: label(line.category),
                  })}
                  description={<FormattedMessage {...m.removeBody} />}
                  cancelLabel={<FormattedMessage {...commonMessages.cancel} />}
                  confirmLabel={<FormattedMessage {...m.removeConfirm} />}
                  onConfirm={() => void remove(line.category)}
                />
              </>
            )}
          </HStack>
        )}
      </Grid>
    )
  }

  return (
    <Stack gap="tight" data-testid="indirect-budget-panel">
      <Box>
        <Heading size="h3" color="primary">
          <FormattedMessage {...m.heading} />
        </Heading>
        <Text size="sm" color="muted" mt={1}>
          <FormattedMessage {...m.caption} />
        </Text>
      </Box>

      <Text size="sm" data-testid="indirect-budget-totals">
        <FormattedMessage
          {...m.totals}
          values={{
            indirect: formatMoney(data.indirectAllocated),
            unallocated: formatMoney(data.unallocated),
          }}
        />
      </Text>

      <Stack
        gap={0}
        rounded="lg"
        borderWidth="1px"
        borderColor="border"
        bg="bg.panel"
      >
        <Grid
          templateColumns={LINE_COLUMNS}
          columnGap={4}
          px={4}
          py={2}
          display={{ base: 'none', md: 'grid' }}
        >
          <Text size="xs" color="muted">
            <FormattedMessage {...m.lineLabel} />
          </Text>
          <Text size="xs" color="muted" textAlign="right">
            <FormattedMessage {...m.amountLabel} />
          </Text>
          <Text size="xs" color="muted" textAlign="right">
            <FormattedMessage {...m.spentLabel} />
          </Text>
        </Grid>
        {data.lines.length === 0 ? (
          <Text
            size="sm"
            color="muted"
            px={4}
            py={3}
            borderTopWidth="1px"
            borderColor="border.muted"
          >
            <FormattedMessage {...m.empty} />
          </Text>
        ) : (
          data.lines.map(row)
        )}
      </Stack>

      {canEdit && available.length > 0 && (
        <Flex
          gap={3}
          align="flex-end"
          wrap="wrap"
          data-testid="indirect-budget-add"
        >
          <Stack gap={1} minW="12rem">
            <Label htmlFor="indirect-budget-new-category" mb={0}>
              <FormattedMessage {...m.addCategory} />
            </Label>
            <Select
              id="indirect-budget-new-category"
              value={newCategory}
              onChange={(value) =>
                setNewCategory(
                  INDIRECT_CATEGORIES.find((c) => c === value) ?? '',
                )
              }
              options={available.map((category) => ({
                value: category,
                label: label(category),
              }))}
            />
          </Stack>
          <Stack gap={1} minW="10rem">
            <Label htmlFor="indirect-budget-new-amount" mb={0}>
              <FormattedMessage {...m.addAmount} />
            </Label>
            <CurrencyInput
              id="indirect-budget-new-amount"
              currency={currency}
              value={newAmount}
              onValueChange={(details) => setNewAmount(details.value)}
            />
          </Stack>
          <Button
            disabled={newCategory === '' || newAmount === '' || isSaving}
            onClick={async () => {
              if (newCategory === '') return
              if (await save(newCategory, newAmount)) {
                setNewCategory('')
                setNewAmount('')
              }
            }}
          >
            <FormattedMessage {...m.add} />
          </Button>
        </Flex>
      )}
    </Stack>
  )
}
