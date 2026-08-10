import { Box } from '@chakra-ui/react'
import { AlertTriangle, Zap } from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage } from 'react-intl'

import { Button, Text } from '@/components'
import { Modal } from '@/components/ui/modal'
import { useIntlToast } from '@/i18n'
import type { ApiError } from '@/services'
import {
  useForceStartSubtaskMutation,
  useForceStartTaskMutation,
} from '@/services/task'
import { getForceStartIconColor } from '@/utils'

import { forceStartMessages as m } from './force-start-messages'
import type { ForceStartTarget } from './force-start-target'

interface ForceStartDirectProps {
  target: ForceStartTarget
  id: string
  name: string
}

/**
 * The direct door of force-start, for whoever holds `forceStart.direct` —
 * owner, admin and manager. They decide requests, so they never file one: they
 * override the block here and the activity starts on the spot, permanently
 * marked at risk.
 *
 * Two backend endpoints, not one: a phase/activity goes to
 * `POST /v1/tasks/{id}/force-start`, a subactivity to
 * `POST /v1/tasks/subtasks/{id}/force-start`. `target` picks the door.
 */
export function ForceStartDirect({ target, id, name }: ForceStartDirectProps) {
  const [open, setOpen] = useState(false)
  const toast = useIntlToast()
  const [forceStartTask, taskState] = useForceStartTaskMutation()
  const [forceStartSubtask, subtaskState] = useForceStartSubtaskMutation()

  const isTask = target === 'task'
  const isLoading = taskState.isLoading || subtaskState.isLoading

  const onConfirm = async () => {
    try {
      await (isTask ? forceStartTask(id) : forceStartSubtask({ id })).unwrap()
      toast.success(isTask ? m.directSuccessTask : m.directSuccessSubtask)
      setOpen(false)
    } catch (error) {
      // 400 is the backend's one refusal here: the activity is no longer
      // blocked, so there is nothing to override. Saying "could not force it"
      // would send someone hunting a failure that never happened.
      const status = (error as ApiError).status
      toast.error(status === 400 ? m.directNotBlocked : m.directError)
      setOpen(false)
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
        <FormattedMessage {...m.directButton} />
      </Button>

      <Modal
        variant="confirmation"
        size="sm"
        open={open}
        onOpenChange={setOpen}
        icon={AlertTriangle}
        iconColor={getForceStartIconColor().color}
        title={<FormattedMessage {...m.directTitle} />}
        description={
          <FormattedMessage {...m.directDescription} values={{ name }} />
        }
        cancelLabel={<FormattedMessage {...m.cancel} />}
        confirmLabel={
          <FormattedMessage
            {...(isLoading ? m.directConfirmLoading : m.directConfirm)}
          />
        }
        onConfirm={onConfirm}
        isConfirming={isLoading}
      >
        <Text size="sm" color="muted">
          <FormattedMessage
            {...(isTask ? m.directBannerTask : m.directBannerSubtask)}
          />
        </Text>
      </Modal>
    </>
  )
}
