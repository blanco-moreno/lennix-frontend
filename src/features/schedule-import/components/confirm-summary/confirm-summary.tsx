/**
 * The confirm step's summary: everything go-live will record, in one read.
 *
 * Three subjects, three panels — the project's own fields, the schedule's
 * shape, and the money — laid out across the width the wizard now has instead
 * of down a single column. The values shown are the ones that will actually be
 * written: the header's pending edits are merged in, because a summary that
 * echoes the file while the user renamed the obra is a summary of the wrong
 * thing.
 *
 * It carries no button. The Activate action lives in the wizard's nav, where
 * every other step's primary action lives.
 */

import { Grid, Stack } from '@chakra-ui/react'
import {
  CalendarRange,
  Coins,
  Layers,
  ListTree,
  PiggyBank,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import { useIntl } from 'react-intl'

import { Heading, Text } from '@/components'
import { StatCard } from '@/components/ui/stat-card'
import { useFormatDate } from '@/i18n'
import type {
  PlanQuotaFailure,
  ProjectActivationDetails,
  ReviewProject,
  ReviewTask,
} from '@/types'
import { formatMoney } from '@/utils'

import { PlanQuotaNotice } from '../plan-quota-notice'

import { confirmSummaryMessages as m } from './confirm-summary-messages'

export interface ConfirmSummaryProps {
  project: ReviewProject
  tasks: ReviewTask[]
  /** The header's pending edits — what go-live will actually write. */
  details?: ProjectActivationDetails
  quotaFailure?: PlanQuotaFailure | null
  failed?: boolean
}

export function ConfirmSummary({
  project,
  tasks,
  details,
  quotaFailure = null,
  failed = false,
}: ConfirmSummaryProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()

  const subtaskCount = tasks.reduce(
    (total, task) => total + task.subtasks.length,
    0,
  )
  const days = tasks
    .flatMap((task) => [
      task.startDate,
      task.dueDate,
      ...task.subtasks.flatMap((subtask) => [
        subtask.startDate,
        subtask.dueDate,
      ]),
    ])
    .filter((day): day is string => day !== null)
    .sort()
  const start = days[0] ?? null
  const end = days.at(-1) ?? null

  const budget = details?.budget ?? project.budget
  const allocated = tasks.reduce((total, task) => total + (task.budget ?? 0), 0)
  const remainder = budget === null ? null : budget - allocated
  const overrun = remainder !== null && remainder < 0

  return (
    <Stack gap={5} data-testid="confirm-summary">
      <Stack gap={1}>
        <Heading size="h4" color="primary">
          {intl.formatMessage(m.title)}
        </Heading>
        <Text size="sm" color="muted">
          {intl.formatMessage(m.explainer)}
        </Text>
      </Stack>

      <Grid
        gap={4}
        templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
      >
        <StatCard
          icon={Layers}
          semantic="info"
          label={intl.formatMessage(m.mainTasks)}
          value={tasks.length}
        />
        <StatCard
          icon={ListTree}
          semantic="info"
          label={intl.formatMessage(m.subtasks)}
          value={subtaskCount}
        />
        <StatCard
          icon={CalendarRange}
          semantic="complementary"
          label={intl.formatMessage(m.startDate)}
          value={start ? formatDate(start) : intl.formatMessage(m.noDates)}
        />
        <StatCard
          icon={CalendarRange}
          semantic="complementary"
          label={intl.formatMessage(m.endDate)}
          value={end ? formatDate(end) : intl.formatMessage(m.noDates)}
        />
      </Grid>

      {/* The obra's own fields are not repeated here: the wizard's header
          carries them at every step, and editable, which is more than a
          read-only echo of the same three lines could offer. */}
      <Grid
        gap={4}
        templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
      >
        {budget === null ? (
          <StatCard
            icon={Wallet}
            semantic="default"
            label={intl.formatMessage(m.budgetSection)}
            value={intl.formatMessage(m.noBudget)}
          />
        ) : (
          <>
            <StatCard
              icon={Wallet}
              semantic="success"
              label={intl.formatMessage(m.projectBudget)}
              value={formatMoney(budget)}
            />
            <StatCard
              icon={PiggyBank}
              semantic="info"
              label={intl.formatMessage(m.allocated)}
              value={formatMoney(allocated)}
            />
            {remainder !== null && (
              <StatCard
                icon={overrun ? TrendingDown : Coins}
                semantic={overrun ? 'overBudget' : 'complementary'}
                label={intl.formatMessage(overrun ? m.overrun : m.unallocated)}
                value={
                  <Text
                    as="span"
                    weight="semibold"
                    size="lg"
                    color={overrun ? 'overBudget' : undefined}
                    data-testid="confirm-summary-remainder"
                  >
                    {formatMoney(Math.abs(remainder))}
                  </Text>
                }
              />
            )}
          </>
        )}
      </Grid>

      {quotaFailure && <PlanQuotaNotice failure={quotaFailure} />}

      {failed && (
        <Text size="sm" color="error">
          {intl.formatMessage(m.activateFailed)}
        </Text>
      )}
    </Stack>
  )
}
