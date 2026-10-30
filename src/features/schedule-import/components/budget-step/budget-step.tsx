/**
 * Step 3 — the budget, split across the main activities.
 *
 * It writes nothing on its own. Editing here is editing the same draft the
 * header edits, and the wizard's Save is what writes both: a second Save
 * button on this step meant "Save and continue later" could walk away from
 * amounts the user had just typed.
 *
 * The task-budget response's `allocated` is never rendered either. It counts
 * *live* tasks, so for a draft it is always `0` — showing it would answer
 * "assigned: 0" to a user who just allocated the whole budget; the balance is
 * summed from the draft by `summarizeAllocation`.
 */

import { Grid, Stack } from '@chakra-ui/react'
import { AlertTriangle, FileSpreadsheet, Wallet } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Alert, CurrencySelect, EmptyState, Label, Text } from '@/components'
import { CurrencyInput } from '@/components/ui/currency-input'
import type {
  CostCurrency,
  CostSource,
  FileBudget,
  ReviewProject,
  ReviewTask,
} from '@/types'

import {
  type ProjectDetailsDraft,
  summarizeAllocation,
} from '../../project-details-draft'
import { AllocationBalance } from '../allocation-balance'

import { budgetStepMessages as m } from './budget-step-messages'

/**
 * One column for the labels, one for the amounts. Every currency input lands
 * on the same track, so the numbers line up as a column — which is the only
 * way a list of amounts reads as a total.
 */
const BUDGET_COLUMNS = {
  base: 'minmax(0, 1fr) 10rem',
  md: 'minmax(0, 1fr) 14rem',
}

/** The largest amount a budget stores (ms-bk `MAX_STORED_AMOUNT`, IMP-13). */
const MAX_STORED_AMOUNT = 9_999_999_999.99

export interface BudgetStepProps {
  project: ReviewProject
  tasks: ReviewTask[]
  /** The wizard's one draft — the header edits the other half of it. */
  draft: ProjectDetailsDraft
  onEdit: (patch: Partial<ProjectDetailsDraft>) => void
  /** What the amounts owe the file (IMP-13); `none` says nothing. */
  fileBudget?: FileBudget
  costSource?: CostSource | null
  costsUnread?: number
  /** The currency the file's costs name (contract 2.6); null when none. */
  fileCurrency?: CostCurrency | null
}

export function BudgetStep({
  project,
  tasks,
  draft,
  onEdit: edit,
  fileBudget = 'none',
  costSource = null,
  costsUnread = 0,
  fileCurrency = null,
}: BudgetStepProps) {
  const intl = useIntl()

  if (tasks.length === 0) {
    return <EmptyState icon={Wallet} title={intl.formatMessage(m.emptyTitle)} />
  }

  const rows = [
    {
      id: 'budget-step-project',
      label: intl.formatMessage(m.projectBudgetLabel),
      value: draft.budget,
      onChange: (value: string) => edit({ budget: value }),
      isProject: true,
    },
    ...tasks.map((task) => ({
      id: `task-budget-${task.id}`,
      label: task.title,
      value: draft.taskBudgets[task.id] ?? '',
      onChange: (value: string) =>
        edit({ taskBudgets: { ...draft.taskBudgets, [task.id]: value } }),
      isProject: false,
    })),
  ]

  // The file named a currency and the reviewer picked another: nothing
  // converts (`BUD-10`), so the amounts it filled in are in the wrong one.
  const currencyMismatch =
    fileBudget === 'applied' &&
    fileCurrency !== null &&
    fileCurrency !== draft.currency

  return (
    <Stack gap={6} data-testid="budget-step" maxW="56rem">
      <Grid templateColumns={BUDGET_COLUMNS} alignItems="center" columnGap={4}>
        <Stack gap={0.5}>
          <Label htmlFor="budget-step-currency" mb={0}>
            {intl.formatMessage(m.currencyLabel)}
          </Label>
          <Text size="xs" color="muted">
            {intl.formatMessage(m.currencyHint)}
          </Text>
        </Stack>
        <CurrencySelect
          id="budget-step-currency"
          value={draft.currency}
          onChange={(currency) => edit({ currency })}
        />
      </Grid>
      {fileBudget === 'foreign_currency' && (
        <Alert
          variant="overBudget"
          icon={AlertTriangle}
          data-testid="file-budget-notice"
        >
          <Stack gap={1}>
            <Text weight="medium" size="sm">
              {intl.formatMessage(m.fileBudgetForeignTitle, {
                currency: fileCurrency ?? '',
              })}
            </Text>
            <Text size="sm">{intl.formatMessage(m.fileBudgetForeignBody)}</Text>
          </Stack>
        </Alert>
      )}
      {currencyMismatch && (
        <Alert
          variant="overBudget"
          icon={AlertTriangle}
          data-testid="currency-mismatch-notice"
        >
          <Stack gap={1}>
            <Text weight="medium" size="sm">
              {intl.formatMessage(m.currencyMismatchTitle, {
                fileCurrency,
                currency: draft.currency,
              })}
            </Text>
            <Text size="sm">
              {intl.formatMessage(m.currencyMismatchBody, {
                fileCurrency,
              })}
            </Text>
          </Stack>
        </Alert>
      )}
      {fileBudget === 'applied' && (
        <Alert icon={FileSpreadsheet} data-testid="file-budget-notice">
          <Stack gap={1}>
            <Text weight="medium" size="sm">
              {intl.formatMessage(m.fileBudgetAppliedTitle)}
            </Text>
            <Text size="sm">
              {intl.formatMessage(m.fileBudgetAppliedBody, {
                source: costSource ?? 'stated',
              })}
            </Text>
            <Text size="sm">{intl.formatMessage(m.fileBudgetNetNote)}</Text>
            {fileCurrency === null && (
              <Text size="sm">
                {intl.formatMessage(m.fileBudgetCurrencyUnknown)}
              </Text>
            )}
            {costsUnread > 0 && (
              <Text size="sm" color="muted">
                {intl.formatMessage(m.fileBudgetUnread, { count: costsUnread })}
              </Text>
            )}
          </Stack>
        </Alert>
      )}
      {fileBudget === 'out_of_range' && (
        <Alert
          variant="overBudget"
          icon={AlertTriangle}
          data-testid="file-budget-notice"
        >
          <Stack gap={1}>
            <Text weight="medium" size="sm">
              {intl.formatMessage(m.fileBudgetOutOfRangeTitle)}
            </Text>
            <Text size="sm">
              {intl.formatMessage(m.fileBudgetOutOfRangeBody, {
                max: Math.floor(MAX_STORED_AMOUNT),
              })}
            </Text>
          </Stack>
        </Alert>
      )}
      <Stack
        gap={0}
        rounded="lg"
        borderWidth="1px"
        borderColor="border"
        bg="bg.panel"
      >
        {rows.map((row, index) => (
          <Grid
            key={row.id}
            templateColumns={BUDGET_COLUMNS}
            alignItems="center"
            columnGap={4}
            px={4}
            py={row.isProject ? 3 : 2.5}
            borderTopWidth={index === 0 ? undefined : '1px'}
            borderColor={index === 1 ? 'border' : 'border.muted'}
            bg={row.isProject ? 'bg.subtle' : undefined}
            _hover={row.isProject ? undefined : { bg: 'bg.muted/50' }}
          >
            <Label htmlFor={row.id} mb={0}>
              {row.label}
            </Label>
            <CurrencyInput
              id={row.id}
              currency={draft.currency}
              value={row.value}
              onValueChange={(details) => row.onChange(details.value)}
            />
          </Grid>
        ))}
      </Stack>

      <AllocationBalance
        allocation={summarizeAllocation(project, draft, tasks)}
      />
    </Stack>
  )
}
