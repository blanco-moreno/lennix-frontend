import { defineMessages } from 'react-intl'

export const subtaskRowMessages = defineMessages({
  blocked: {
    id: 'subtaskRow.blocked',
    defaultMessage: 'Blocked',
    description: 'Badge shown when the subtask is blocked by dependencies',
  },
  criticalPath: {
    id: 'subtaskRow.criticalPath',
    defaultMessage: 'Critical Path',
    description: 'Badge marking the subtask as part of the critical path',
  },
})
