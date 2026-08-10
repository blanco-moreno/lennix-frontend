import { defineMessages } from 'react-intl'

export const priorityMessages = defineMessages({
  critical: {
    id: 'priority.critical',
    defaultMessage: 'Critical',
    description: 'Task priority label: critical',
  },
  high: {
    id: 'priority.high',
    defaultMessage: 'High',
    description: 'Task priority label: high',
  },
  medium: {
    id: 'priority.medium',
    defaultMessage: 'Medium',
    description: 'Task priority label: medium',
  },
  low: {
    id: 'priority.low',
    defaultMessage: 'Low',
    description: 'Task priority label: low',
  },
  normal: {
    id: 'priority.normal',
    defaultMessage: 'Normal',
    description: 'Task priority label: fallback when value is unrecognised',
  },
})

export function priorityKey(priority: string): keyof typeof priorityMessages {
  switch (priority) {
    case 'critical':
      return 'critical'
    case 'high':
      return 'high'
    case 'medium':
      return 'medium'
    case 'low':
      return 'low'
    default:
      return 'normal'
  }
}
