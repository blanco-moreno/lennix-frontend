import { Box, Flex, HStack, Stack, chakra } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Badge,
  Label,
  ModalFormFooter,
  Select,
  Slider,
  Text,
  FormDrawer,
} from '@/components'
import { blockedReasonMessages } from '@/features'
import { useDelayReasonLabel, useStatusLabel } from '@/hooks'
import {
  buildSubtaskProgressSchema,
  DELAY_REASONS,
  taskValidationMessages,
  type SubtaskProgressFormValues,
} from '@/schemas'
import {
  readSubtaskBlockedFailure,
  useUpdateSubtaskProgressMutation,
} from '@/services/task'
import type { Subtask, SubtaskStatus } from '@/types'
import {
  formatPercent,
  getTaskStatusColor,
  getProgressBadgeColor,
  resolveProgressHealth,
} from '@/utils'

import { taskDetailViewMessages } from '../../task-detail-view-messages'

import { deriveStatusFromProgress } from './progress-status'
import { subtaskProgressModalMessages as m } from './subtask-progress-form-messages'

type DelayReasonValue = (typeof DELAY_REASONS)[number]

interface SubtaskProgressFormProps {
  subtask: Subtask | null
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SubtaskProgressFormInner({
  subtask,
  projectId,
  open,
  onOpenChange,
}: SubtaskProgressFormProps & { subtask: Subtask }) {
  const intl = useIntl()
  const statusLabel = useStatusLabel()
  const delayReasonLabel = useDelayReasonLabel()
  const [updateProgress, { isLoading }] = useUpdateSubtaskProgressMutation()

  const minProgress = subtask.progress

  const form = useForm<SubtaskProgressFormValues>({
    resolver: zodResolver(
      buildSubtaskProgressSchema(
        minProgress,
        intl.formatMessage(taskValidationMessages.progressBelowMin, {
          minProgress,
        }),
      ),
    ),
    defaultValues: {
      progress: subtask.progress,
      delayReason: (subtask.delayReason ?? null) as DelayReasonValue | null,
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      progress: subtask.progress,
      delayReason: (subtask.delayReason ?? null) as DelayReasonValue | null,
    })
  }, [open, subtask.progress, subtask.delayReason, form])

  // react-hook-form's watch() is not React Compiler-compatible yet.
  // eslint-disable-next-line react-hooks/incompatible-library
  const progress = form.watch('progress')
  const delayReason = form.watch('delayReason')

  const currentStatus = subtask.status as SubtaskStatus
  const nextStatus = deriveStatusFromProgress(progress, currentStatus)
  // The reason input is always offered so anyone can flag a delay proactively;
  // the "N days behind" notice only shows once the engine has derived a delay.
  const isLate = subtask.delayDays > 0
  const reasonChanged = delayReason !== (subtask.delayReason ?? null)
  const hasChanged = progress !== subtask.progress || reasonChanged

  const handleProgressChange = (value: number) => {
    form.setValue('progress', Math.max(value, minProgress), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const onSubmit = async () => {
    try {
      await updateProgress({
        id: subtask.id,
        projectId,
        // Omitted, never null: ms-bk reads absence as "keep what is stored" and
        // an explicit null as "drop it", so sending null from a report that was
        // never asked for a cause would erase one already recorded.
        body: {
          progress,
          ...(reasonChanged && delayReason
            ? { delay_reason: delayReason }
            : {}),
        },
      }).unwrap()
      toast.success(intl.formatMessage(m.progressUpdateSuccess), {
        id: m.progressUpdateSuccess.id,
      })
      onOpenChange(false)
    } catch (error) {
      // The refusal is a race here — the panel does not offer the modal for a
      // blocked subactivity — but a race the person can still lose, so it is
      // worth naming rather than flattening into "could not update".
      const blocked = readSubtaskBlockedFailure(error)
      if (blocked) {
        toast.error(
          blocked.blockedBy.length > 0
            ? intl.formatMessage(blockedReasonMessages.blockedWaitingOn, {
                names: blocked.blockedBy
                  .map((b) => b.title)
                  .join(
                    intl.formatMessage(
                      blockedReasonMessages.blockedListSeparator,
                    ),
                  ),
                count: blocked.blockedBy.length,
              })
            : intl.formatMessage(blockedReasonMessages.blockedByBrokenEdge),
          { id: 'subtask-blocked' },
        )
        onOpenChange(false)
        return
      }
      toast.error(intl.formatMessage(m.progressUpdateError), {
        id: m.progressUpdateError.id,
      })
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={intl.formatMessage(m.progressModalTitle)}
      description={intl.formatMessage(m.progressModalDescription, {
        name: subtask.title,
      })}
      onSubmit={form.handleSubmit(onSubmit)}
      footer={
        <ModalFormFooter
          submitLabel={taskDetailViewMessages.update}
          isLoading={isLoading}
          submitDisabled={!hasChanged}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <Stack gap="section">
        <Flex
          align="center"
          justify="space-between"
          wrap="wrap"
          rounded="lg"
          bg="bg.subtle"
          p="cardSm"
          gap={2}
        >
          <Box>
            <Text size="xs" color="muted">
              <FormattedMessage {...m.currentStatusLabel} />
            </Text>
            <Text size="sm" weight="medium" color="primary">
              {formatPercent(subtask.progress)} · {statusLabel(currentStatus)}
            </Text>
          </Box>
          <HStack gap={2}>
            <Badge {...getProgressBadgeColor(resolveProgressHealth(subtask))}>
              {formatPercent(progress)}
            </Badge>
            <Badge {...getTaskStatusColor(nextStatus)}>
              {statusLabel(nextStatus)}
            </Badge>
          </HStack>
        </Flex>

        <Stack gap={0}>
          <Label mb={3} display="block">
            <FormattedMessage {...m.progressLabel} />
          </Label>
          <Slider
            colorPalette="accent"
            value={[progress]}
            onValueChange={(v) => handleProgressChange(v[0])}
            min={0}
            max={100}
            step={5}
          />
          <Flex
            mt={2}
            width="full"
            justify="space-between"
            wrap="wrap"
            fontSize="xs"
            color="fg.subtle"
            gap={2}
          >
            <Box as="span">0%</Box>
            <Box as="span">25%</Box>
            <Box as="span">50%</Box>
            <Box as="span">75%</Box>
            <Box as="span">100%</Box>
          </Flex>
          {minProgress > 0 && (
            <Text size="xs" color="muted" mt={2}>
              <FormattedMessage
                {...m.progressMinWarning}
                values={{ minProgress }}
              />
            </Text>
          )}
          {form.formState.errors.progress && (
            <Text size="sm" color="error" mt={2}>
              {form.formState.errors.progress.message}
            </Text>
          )}
        </Stack>

        <Flex flexWrap="wrap" gap={2}>
          {[0, 25, 50, 75, 100].map((v) => {
            const disabled = v < minProgress
            const selected = progress === v
            return (
              <chakra.button
                key={v}
                type="button"
                disabled={disabled}
                onClick={() => handleProgressChange(v)}
                rounded="md"
                borderWidth="1px"
                px={3}
                py={1.5}
                fontSize="xs"
                fontWeight="medium"
                transition="colors"
                cursor={disabled ? 'not-allowed' : undefined}
                borderColor={
                  disabled ? 'border' : selected ? 'complementary' : 'border'
                }
                bg={
                  disabled
                    ? 'bg.subtle'
                    : selected
                      ? 'complementary/10'
                      : undefined
                }
                color={
                  disabled
                    ? 'fg.subtle'
                    : selected
                      ? 'complementary'
                      : 'fg.muted'
                }
                _hover={
                  !disabled && !selected
                    ? { borderColor: 'border', bg: 'bg.subtle' }
                    : undefined
                }
              >
                {v}%
              </chakra.button>
            )
          })}
        </Flex>

        {/* Always available so a delay can be flagged proactively; the
            "N days behind" notice appears only once the engine derives one. */}
        <Stack gap={2} data-testid="subtask-progress-delay-reason">
          {isLate && (
            <Text size="sm" color="critical">
              <FormattedMessage
                {...m.progressDelayNotice}
                values={{ days: subtask.delayDays }}
              />
            </Text>
          )}
          <Label htmlFor="subtask-progress-reason">
            <FormattedMessage {...m.progressDelayReasonLabel} />
          </Label>
          <Controller
            control={form.control}
            name="delayReason"
            render={({ field }) => (
              <Select
                id="subtask-progress-reason"
                value={field.value ?? ''}
                onChange={(v) => field.onChange(v === '' ? null : v)}
                options={[
                  {
                    value: '',
                    label: intl.formatMessage(m.progressDelayReasonNone),
                  },
                  ...DELAY_REASONS.map((reason) => ({
                    value: reason,
                    label: delayReasonLabel(reason),
                  })),
                ]}
              />
            )}
          />
        </Stack>

        {/* The status as a CONSEQUENCE, never as an input. */}
        <Text size="xs" color="muted">
          <FormattedMessage
            {...m.progressOutcomeNote}
            values={{ status: statusLabel(nextStatus) }}
          />
        </Text>
      </Stack>
    </FormDrawer>
  )
}

export function SubtaskProgressForm({
  subtask,
  projectId,
  open,
  onOpenChange,
}: SubtaskProgressFormProps) {
  if (!subtask) return null

  return (
    <SubtaskProgressFormInner
      key={subtask.id}
      subtask={subtask}
      projectId={projectId}
      open={open}
      onOpenChange={onOpenChange}
    />
  )
}
