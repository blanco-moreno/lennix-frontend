import { defineMessages } from 'react-intl'

/**
 * Shared status label catalog. Maps the raw `status` strings used by
 * the backend (`on_track`, `delayed`, `in_progress`, ...) to translated
 * labels. Use the `useStatusLabel` hook (sibling file) so consumers
 * don't have to thread an `intl` through utility code.
 */
export const statusMessages = defineMessages({
  completed: {
    id: 'status.completed',
    defaultMessage: 'Completed',
    description: 'Project/task status label: completed/done',
  },
  inProgress: {
    id: 'status.inProgress',
    defaultMessage: 'In progress',
    description: 'Task status label: actively being worked on',
  },
  delayed: {
    id: 'status.delayed',
    defaultMessage: 'Delayed',
    description: 'Project/task status label: missed schedule',
  },
  cancelled: {
    id: 'status.cancelled',
    defaultMessage: 'Cancelled',
    description: 'Task status label: cancelled by user',
  },
  pending: {
    id: 'status.pending',
    defaultMessage: 'Pending',
    description: 'Task status label: not started yet',
  },
  onTrack: {
    id: 'status.onTrack',
    defaultMessage: 'On track',
    description: 'Project status label: progressing on schedule',
  },
  ahead: {
    id: 'status.ahead',
    defaultMessage: 'Ahead of schedule',
    description: 'Project status label: progressing faster than planned',
  },
  archived: {
    id: 'status.archived',
    defaultMessage: 'Archived',
    description: 'Project status label: closed and read-only',
  },
  unknown: {
    id: 'status.unknown',
    defaultMessage: 'Unknown',
    description: 'Fallback status label when the backend value is unrecognised',
  },
})

export function statusKey(status: string): keyof typeof statusMessages {
  switch (status) {
    case 'completed':
    case 'done':
      return 'completed'
    case 'in-progress':
    case 'in_progress':
      return 'inProgress'
    case 'delayed':
      return 'delayed'
    case 'cancelled':
      return 'cancelled'
    case 'pending':
    case 'todo':
      return 'pending'
    case 'on_track':
      return 'onTrack'
    case 'ahead':
      return 'ahead'
    case 'archived':
      return 'archived'
    default:
      return 'unknown'
  }
}
