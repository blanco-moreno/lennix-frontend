import { Box, Stack } from '@chakra-ui/react'
import { AlertTriangle, Zap } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, Label, StatusBadge, Text } from '@/components'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { usePermission } from '@/hooks'
import { useIntlToast, useZodResolverIntl } from '@/i18n'
import {
  forceStartRequestSchema,
  forceStartValidationMessages,
  type ForceStartRequestFormValues,
} from '@/schemas'
import {
  useCreateForceStartRequestMutation,
  useListForceStartRequestsQuery,
} from '@/services/force-start'
import {
  getForceStartIconColor,
  getForceStartBannerColor,
  getForceStartBannerTextColor,
} from '@/utils'

import { ForceStartDirect } from './force-start-direct'
import { forceStartMessages as m } from './force-start-messages'
import type { ForceStartTarget } from './force-start-target'

export type { ForceStartTarget }

interface ForceStartProps {
  target: ForceStartTarget
  id: string
  /** Name shown in the request, so the approver knows what is being forced. */
  name: string
}

/**
 * The one force-start surface. This component owns the whole interaction:
 * trigger, justification, request, toast and the pending state. Surfaces only
 * say *what* is being force-started.
 *
 * Two doors, never both for the same person, exactly as the backend splits
 * them. Whoever holds `forceStart.direct` (owner, admin, manager) overrides the
 * block outright — that path lives in `ForceStartDirect`. Whoever holds
 * `forceStart.request` (the `user`) gets what is below: a request an approver
 * decides in the bandeja, and only that approval force-starts the task and
 * stamps its permanent at-risk mark. Nobody holds both keys, so self-approval
 * cannot arise by construction.
 */
export function ForceStart({ target, id, name }: ForceStartProps) {
  const [open, setOpen] = useState(false)
  const [justRequested, setJustRequested] = useState(false)
  const intl = useIntl()
  const toast = useIntlToast()
  const canRequest = usePermission('forceStart.request')
  const canDirect = usePermission('forceStart.direct')
  const canDecide = usePermission('forceStart.approval.decide')
  const [createRequest, { isLoading }] = useCreateForceStartRequestMutation()

  // Asked by anyone who has a stake in a pending request: a decider sees the
  // organization's, a requester sees their own (the backend scopes the list to
  // `requestor_id`). Asked without `taskId` so every row shares one cache entry
  // (the approvals badge subscribes to the same query); `selectFromResult`
  // scopes re-renders.
  const { hasPendingRequest } = useListForceStartRequestsQuery(
    { state: 'pending' },
    {
      skip: !canDecide && !canRequest,
      selectFromResult: ({ data }) => ({
        hasPendingRequest: (data?.items ?? []).some(
          (request) => request.taskId === id,
        ),
      }),
    },
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForceStartRequestFormValues>({
    resolver: useZodResolverIntl(
      forceStartRequestSchema,
      forceStartValidationMessages,
    ),
    defaultValues: { reason: '' },
  })

  const isTask = target === 'task'
  const hasPending = justRequested || hasPendingRequest

  if (canDirect) return <ForceStartDirect target={target} id={id} name={name} />
  if (!canRequest) return null

  if (hasPending) {
    return (
      <StatusBadge
        domain="approval"
        value="pending"
        label={intl.formatMessage(m.pendingBadge)}
      />
    )
  }

  const onSubmit = async (values: ForceStartRequestFormValues) => {
    try {
      await createRequest({ taskId: id, reason: values.reason.trim() }).unwrap()
      toast.success(isTask ? m.successTask : m.successSubtask)
      setJustRequested(true)
      setOpen(false)
      reset()
    } catch {
      toast.error(isTask ? m.errorTask : m.errorSubtask)
    }
  }

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
      >
        <Box as={Zap} boxSize={3.5} mr={1} />
        <FormattedMessage {...m.button} />
      </Button>

      <Modal
        size="sm"
        open={open}
        onOpenChange={setOpen}
        icon={AlertTriangle}
        iconColor={getForceStartIconColor().color}
        title={<FormattedMessage {...m.title} />}
        description={<FormattedMessage {...m.description} values={{ name }} />}
        onSubmit={handleSubmit(onSubmit)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              <FormattedMessage {...m.cancel} />
            </Button>
            <Button type="submit" disabled={isLoading}>
              <FormattedMessage
                {...(isLoading ? m.confirmLoading : m.confirm)}
              />
            </Button>
          </>
        }
      >
        <Stack gap="field">
          <Box
            rounded="lg"
            borderWidth="1px"
            p="cardSm"
            {...getForceStartBannerColor()}
          >
            <Text size="sm" {...getForceStartBannerTextColor()}>
              <FormattedMessage
                {...(isTask ? m.bannerTask : m.bannerSubtask)}
              />
            </Text>
          </Box>

          <Stack gap={2}>
            <Label htmlFor="force-start-reason">
              <FormattedMessage {...m.reasonLabel} />
            </Label>
            <Textarea
              id="force-start-reason"
              rows={3}
              placeholder={intl.formatMessage(m.reasonPlaceholder)}
              aria-invalid={!!errors.reason}
              {...register('reason')}
            />
            {errors.reason?.message && (
              <Text size="sm" color="error">
                {String(errors.reason.message)}
              </Text>
            )}
          </Stack>
        </Stack>
      </Modal>
    </>
  )
}
