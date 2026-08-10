/**
 * Copy for the quick-edit modals — the fast path for the fields people
 * actually touch, shared by the task and subtask variants.
 */

import { defineMessages } from 'react-intl'

export const quickEditMessages = defineMessages({
  quickEditTitle: {
    id: 'taskDetail.quickEditTitle',
    defaultMessage: 'Edit subactivity',
    description: 'Title of the subactivity edit drawer',
  },
  quickEditDescription: {
    id: 'taskDetail.quickEditDescription',
    defaultMessage: 'Edit “{name}”.',
    description:
      'Subtitle of the subactivity edit drawer — names the subactivity',
  },
  quickEditTaskTitlePlaceholder: {
    id: 'taskDetail.quickEditTaskTitlePlaceholder',
    defaultMessage: 'Main activity title',
    description: 'Placeholder for the task quick-edit title',
  },
  quickEditSubtaskTitlePlaceholder: {
    id: 'taskDetail.quickEditSubtaskTitlePlaceholder',
    defaultMessage: 'Subactivity title',
    description: 'Placeholder for the subtask quick-edit title',
  },
  subtaskUpdateSuccess: {
    id: 'taskDetail.subtaskUpdateSuccess',
    defaultMessage: 'Subactivity updated',
    description: 'Toast after updating a subtask',
  },
  subtaskUpdateError: {
    id: 'taskDetail.subtaskUpdateError',
    defaultMessage: 'Could not update the subactivity',
    description: 'Toast when updating a subtask fails',
  },
  save: {
    id: 'taskDetail.save',
    defaultMessage: 'Save',
    description: 'Generic save submit label',
  },
  taskUpdateSuccess: {
    id: 'quickEdit.taskUpdateSuccess',
    defaultMessage: 'Main activity updated',
    description: 'Toast after updating an activity',
  },
  taskUpdateError: {
    id: 'quickEdit.taskUpdateError',
    defaultMessage: 'Could not update the main activity',
    description: 'Toast when updating an activity fails',
  },
  titleLabel: {
    id: 'quickEdit.titleLabel',
    defaultMessage: 'Title',
    description: 'Generic label for the title field on task/subtask forms',
  },
  assigneeLabel: {
    id: 'quickEdit.assigneeLabel',
    defaultMessage: 'Assignee',
    description: 'Generic label for the task assignee field',
  },
  statusLabel: {
    id: 'quickEdit.statusLabel',
    defaultMessage: 'Status',
    description: 'Generic label for the task status field',
  },
  priorityLabel: {
    id: 'quickEdit.priorityLabel',
    defaultMessage: 'Priority',
    description: 'Generic label for the task priority field',
  },
  startDateLabel: {
    id: 'quickEdit.startDateLabel',
    defaultMessage: 'Start date',
    description: 'Label for the subtask start-date field',
  },
  dueDateLabel: {
    id: 'quickEdit.dueDateLabel',
    defaultMessage: 'Due date',
    description: 'Label for the subtask due-date field',
  },
  unassigned: {
    id: 'quickEdit.unassigned',
    defaultMessage: 'Unassigned',
    description: 'Fallback value when no user is assigned',
  },
})
