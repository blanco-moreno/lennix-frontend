import { defineMessages } from 'react-intl'

export const taskListHeaderMessages = defineMessages({
  columnTask: {
    id: 'taskList.columnTask',
    defaultMessage: 'Activity',
    description: 'Column header over the activity name in the /tasks listing',
  },
  columnProgress: {
    id: 'taskList.columnProgress',
    defaultMessage: 'Progress',
    description: 'Column header over the progress bar in the /tasks listing',
  },
  columnStatus: {
    id: 'taskList.columnStatus',
    defaultMessage: 'Status',
    description: 'Column header over the status badge in the /tasks listing',
  },
  columnPriority: {
    id: 'taskList.columnPriority',
    defaultMessage: 'Priority',
    description: 'Column header over the priority badge in the /tasks listing',
  },
  columnAssignee: {
    id: 'taskList.columnAssignee',
    defaultMessage: 'Assignee',
    description:
      'Column header over the person responsible for the activity, in the portfolio list',
  },
  columnProject: {
    id: 'taskList.columnProject',
    defaultMessage: 'Project',
    description:
      'Column header over the obra a row belongs to, in the "assigned to me" queue',
  },
  columnDueDate: {
    id: 'taskList.columnDueDate',
    defaultMessage: 'Due date',
    description: 'Column header over the due date in the /tasks listing',
  },
})
