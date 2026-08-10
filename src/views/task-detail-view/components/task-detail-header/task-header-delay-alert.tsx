import { Box } from '@chakra-ui/react'
import { Activity } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Alert, Text } from '@/components'
import { useDelayReasonLabel } from '@/hooks'
import type { Task } from '@/types'

import { taskDetailViewMessages } from '../../task-detail-view-messages'

interface TaskHeaderDelayAlertProps {
  task: Task
}

/**
 * The delay the activity carries, and why. Its own component because on a
 * phone it reads as detail — folded away with the dates — while the progress
 * it sits next to stays on screen.
 */
export function TaskHeaderDelayAlert({ task }: TaskHeaderDelayAlertProps) {
  const delayReasonLabel = useDelayReasonLabel()

  if (!task.delayReason) return null

  return (
    <Alert
      icon={Activity}
      iconProps={{ color: 'critical' }}
      borderColor="critical/30"
      bg="critical/5"
    >
      <Box as="strong" color="critical">
        <FormattedMessage
          {...taskDetailViewMessages.delayMessage}
          values={{ days: task.delayDays }}
        />
      </Box>
      <Text size="sm" mt={1}>
        {delayReasonLabel(task.delayReason)}
      </Text>
    </Alert>
  )
}
