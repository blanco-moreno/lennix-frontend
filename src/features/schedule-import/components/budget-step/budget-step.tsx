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
 * "assigned: 0" to a user who just allocated the whole budget. The balance
 * below is summed here instead.
 */

import { Grid, Stack } from '@chakra-ui/react'
import { Wallet } from 'lucide-react'
import { useIntl } from 'react-intl'

import { EmptyState, Heading, Label, Progress, Text } from '@/components'
import { CurrencyInput } from '@/components/ui/currency-input'
import type { ReviewProject, ReviewTask } from '@/types'
import { formatMoney } from '@/utils'

import {
  type ProjectDetailsDraft,
  summarizeAllocation,
} from '../../project-details-draft'

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

export interface BudgetStepProps {
  project: ReviewProject
  tasks: ReviewTask[]
  /** The wizard's one draft — the header edits the other half of it. */
  draft: ProjectDetailsDraft
  onEdit: (patch: Partial<ProjectDetailsDraft>) => void
}

export function BudgetStep({
  project,
  tasks,
  draft,
  onEdit: edit,
}: BudgetStepProps) {
  const intl = useIntl()

  const allocation = summarizeAllocation(project, draft, tasks)
  // What the balance measures against: the amount being typed, not the saved
  // one — raising the budget resolves an overrun in the same keystroke.
  const typedBudget =
    allocation.unassigned === null
      ? null
      : allocation.assigned + allocation.unassigned

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title={intl.formatMessage(m.emptyTitle)}
        description={intl.formatMessage(m.emptyDescription)}
      />
    )
  }

  return (
    <Stack gap={6} data-testid="budget-step" maxW="56rem">
      <Stack gap={1}>
        <Heading size="h4" color="primary">
          {intl.formatMessage(m.title)}
        </Heading>
        <Text size="sm" color="muted">
          {intl.formatMessage(m.explainer)}
        </Text>
      </Stack>

      <Grid
        templateColumns={BUDGET_COLUMNS}
        alignItems="center"
        columnGap={4}
        rowGap={1}
        px={4}
        py={3}
        rounded="lg"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border"
      >
        <Label htmlFor="budget-step-project" mb={0}>
          {intl.formatMessage(m.projectBudgetLabel)}
        </Label>
        <CurrencyInput
          id="budget-step-project"
          value={draft.budget}
          onValueChange={(details) => edit({ budget: details.value })}
        />
      </Grid>

      <Stack gap={2}>
        <Text
          weight="semibold"
          size="xs"
          color="muted"
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          {intl.formatMessage(m.perTaskTitle)}
        </Text>

        <Stack gap={0} rounded="lg" borderWidth="1px" borderColor="border">
          {tasks.map((task, index) => (
            <Grid
              key={task.id}
              templateColumns={BUDGET_COLUMNS}
              alignItems="center"
              columnGap={4}
              px={4}
              py={2.5}
              borderTopWidth={index === 0 ? undefined : '1px'}
              borderColor="border.muted"
              _hover={{ bg: 'bg.muted/50' }}
            >
              <Label htmlFor={`task-budget-${task.id}`} mb={0}>
                {task.title}
              </Label>
              <CurrencyInput
                id={`task-budget-${task.id}`}
                value={draft.taskBudgets[task.id] ?? ''}
                onValueChange={(details) =>
                  edit({
                    taskBudgets: {
                      ...draft.taskBudgets,
                      [task.id]: details.value,
                    },
                  })
                }
              />
            </Grid>
          ))}
        </Stack>
      </Stack>

      {/* The balance, as the panel it is — a 12px muted line under the last
          input is where a number nobody can find lives. */}
      <Stack
        gap="tight"
        p="card"
        rounded="lg"
        borderWidth="1px"
        borderColor={allocation.overrun ? 'overBudget' : 'border'}
        bg={allocation.overrun ? 'overBudget/5' : 'bg.subtle'}
        data-testid="budget-step-total"
      >
        <Grid
          gap={4}
          templateColumns={{ base: '1fr 1fr', md: 'repeat(3, minmax(0, 1fr))' }}
        >
          <Stack gap={0.5}>
            <Text
              size="xs"
              color="muted"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {intl.formatMessage(m.balanceBudget)}
            </Text>
            <Text size="lg" weight="semibold" color="primary">
              {typedBudget === null
                ? intl.formatMessage(m.balanceNoBudget)
                : formatMoney(typedBudget)}
            </Text>
          </Stack>

          <Stack gap={0.5}>
            <Text
              size="xs"
              color="muted"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {intl.formatMessage(m.balanceAssigned)}
            </Text>
            <Text size="lg" weight="semibold" color="primary">
              {formatMoney(allocation.assigned)}
            </Text>
          </Stack>

          {allocation.unassigned !== null && (
            <Stack gap={0.5}>
              <Text
                size="xs"
                color="muted"
                textTransform="uppercase"
                letterSpacing="0.06em"
              >
                {intl.formatMessage(
                  allocation.overrun ? m.balanceOverrun : m.balanceUnassigned,
                )}
              </Text>
              <Text
                size="lg"
                weight="semibold"
                color={allocation.overrun ? 'overBudget' : 'primary'}
                data-testid="budget-step-remainder"
              >
                {formatMoney(Math.abs(allocation.unassigned))}
              </Text>
            </Stack>
          )}
        </Grid>

        {typedBudget !== null && typedBudget > 0 && (
          <Progress
            value={(allocation.assigned / typedBudget) * 100}
            h={2}
            aria-label={intl.formatMessage(m.balanceAssigned)}
            indicatorProps={
              allocation.overrun ? { bg: 'overBudget' } : undefined
            }
          />
        )}

        <Text size="xs" color={allocation.overrun ? 'overBudget' : 'muted'}>
          {allocation.unassigned === null
            ? intl.formatMessage(m.totalsWithoutBudget, {
                assigned: formatMoney(allocation.assigned),
              })
            : allocation.overrun
              ? intl.formatMessage(m.totalsOverrun, {
                  assigned: formatMoney(allocation.assigned),
                  excess: formatMoney(-allocation.unassigned),
                })
              : intl.formatMessage(m.totals, {
                  assigned: formatMoney(allocation.assigned),
                  unassigned: formatMoney(allocation.unassigned),
                })}
        </Text>
      </Stack>
    </Stack>
  )
}
