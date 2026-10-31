import { defineMessages, type MessageDescriptor } from 'react-intl'

import type { ProjectActivityAction } from '@/types'

/**
 * The Historial's sentences, composed from `action` + values.
 * Placeholders, by action family (see `app/events/handlers/activity_handlers.py`):
 *   - `actor`  — `actor_name`, or the localized system subject when null
 *   - `entity` — `entity_name`: an activity title, or, for a dependency edge,
 *                the successor ("Estructura")
 *   - `old`    — the previous status/progress/date range, or, for a dependency,
 *                the predecessor ("Cimentacion")
 *   - `new`    — the new status/progress/date range, the PDM notation
 *                ("FS +2d"), or the expense amount
 */
export const activityMessages = defineMessages({
  systemActor: {
    id: 'projectActivity.systemActor',
    defaultMessage: 'The system',
    description:
      'Subject of a Historial sentence when the change had no human actor (a cascade, a recomputation)',
  },
  unknownAction: {
    id: 'projectActivity.unknownAction',
    defaultMessage: '{actor} made a change to {entity}.',
    description:
      'Fallback Historial sentence for an action key this build does not know yet — never render the raw key',
  },
  unnamedEntity: {
    id: 'projectActivity.unnamedEntity',
    defaultMessage: 'a deleted item',
    description:
      'Stands in for entity_name when the row it referred to no longer has one',
  },
  // --- the obra itself ----------------------------------------------------
  projectCreated: {
    id: 'projectActivity.projectCreated',
    defaultMessage: '{actor} created this project.',
    description: 'Historial sentence: project.created',
  },
  projectActivated: {
    id: 'projectActivity.projectActivated',
    defaultMessage: '{actor} activated the project from its draft.',
    description: 'Historial sentence: project.activated',
  },
  projectRenamed: {
    id: 'projectActivity.projectRenamed',
    defaultMessage: '{actor} renamed the project: {old} became {new}.',
    description: 'Historial sentence: project.renamed',
  },
  projectBudgetChanged: {
    id: 'projectActivity.projectBudgetChanged',
    defaultMessage: '{actor} changed the budget: {old} became {new}.',
    description: 'Historial sentence: project.budget_changed',
  },
  projectCurrencyChanged: {
    id: 'projectActivity.projectCurrencyChanged',
    defaultMessage:
      '{actor} changed the currency: {old} became {new}. The amounts were not converted.',
    description:
      'Historial sentence: project.currency_changed; old and new are ISO 4217 codes',
  },
  projectLocationChanged: {
    id: 'projectActivity.projectLocationChanged',
    defaultMessage: '{actor} changed the location: {old} became {new}.',
    description: 'Historial sentence: project.location_changed',
  },
  projectDescriptionChanged: {
    id: 'projectActivity.projectDescriptionChanged',
    defaultMessage: '{actor} updated the project description.',
    description:
      'Historial sentence: project.description_changed. The text itself is not quoted — a description is long enough to bury the rest of the feed',
  },
  projectManagerChanged: {
    id: 'projectActivity.projectManagerChanged',
    defaultMessage: '{actor} handed the project over from {old} to {new}.',
    description: 'Historial sentence: project.manager_changed',
  },
  projectMemberAdded: {
    id: 'projectActivity.projectMemberAdded',
    defaultMessage: '{actor} added {entity} to the team.',
    description: 'Historial sentence: project.member_added',
  },
  projectMemberRemoved: {
    id: 'projectActivity.projectMemberRemoved',
    defaultMessage: '{actor} removed {entity} from the team.',
    description: 'Historial sentence: project.member_removed',
  },
  taskCreated: {
    id: 'projectActivity.taskCreated',
    defaultMessage: '{actor} created the activity {entity}.',
    description: 'Historial sentence: task.created',
  },
  taskDeleted: {
    id: 'projectActivity.taskDeleted',
    defaultMessage: '{actor} removed the activity {entity} from the plan.',
    description: 'Historial sentence: task.deleted',
  },
  subtaskCreated: {
    id: 'projectActivity.subtaskCreated',
    defaultMessage: '{actor} added {entity} under {old}.',
    description:
      'Historial sentence: subtask.created. `old` carries the parent activity',
  },
  // --- the risk register --------------------------------------------------
  riskCreated: {
    id: 'projectActivity.riskCreated',
    defaultMessage: '{actor} raised the risk {entity} (severity {new}/9).',
    description: 'Historial sentence: risk.created',
  },
  riskUpdated: {
    id: 'projectActivity.riskUpdated',
    defaultMessage:
      '{actor} reassessed the risk {entity}: severity {old}/9 became {new}/9.',
    description: 'Historial sentence: risk.updated',
  },
  riskClosed: {
    id: 'projectActivity.riskClosed',
    defaultMessage: '{actor} closed the risk {entity}.',
    description: 'Historial sentence: risk.closed',
  },

  // --- derived state, as crossings ----------------------------------------
  taskDelayed: {
    id: 'projectActivity.taskDelayed',
    defaultMessage:
      '{entity} is running late: {new, plural, one {# day} other {# days}} behind.',
    description:
      'Historial sentence: task.delayed. Subjectless — a recalculation crossed the line, not a person',
  },
  taskRecovered: {
    id: 'projectActivity.taskRecovered',
    defaultMessage:
      '{entity} is back on schedule, after {old, plural, one {# day} other {# days}} late.',
    description: 'Historial sentence: task.recovered',
  },
  taskOverBudget: {
    id: 'projectActivity.taskOverBudget',
    defaultMessage: '{entity} went over budget: {new} against {old}.',
    description: 'Historial sentence: task.over_budget',
  },
  taskWithinBudget: {
    id: 'projectActivity.taskWithinBudget',
    defaultMessage: '{entity} is back within budget: {new} against {old}.',
    description: 'Historial sentence: task.within_budget',
  },
  projectDelayed: {
    id: 'projectActivity.projectDelayed',
    defaultMessage:
      'The project is running late: {new, plural, one {# day} other {# days}} behind.',
    description: 'Historial sentence: project.delayed',
  },
  projectRecovered: {
    id: 'projectActivity.projectRecovered',
    defaultMessage:
      'The project is back on schedule, after {old, plural, one {# day} other {# days}} late.',
    description: 'Historial sentence: project.recovered',
  },
  projectOverBudget: {
    id: 'projectActivity.projectOverBudget',
    defaultMessage: 'The project went over budget: {new} against {old}.',
    description: 'Historial sentence: project.over_budget',
  },
  indirectBudgetChanged: {
    id: 'projectActivity.indirectBudgetChanged',
    defaultMessage:
      '{actor} set the overhead line {entity}: {hasOld, select, yes {{old} became {new}} other {{new}}}.',
    description:
      'Historial sentence: indirect_budget.changed; entity is the overhead line',
  },
  indirectBudgetRemoved: {
    id: 'projectActivity.indirectBudgetRemoved',
    defaultMessage: '{actor} removed the overhead line {entity} ({old}).',
    description: 'Historial sentence: indirect_budget.removed',
  },
  indirectOverBudget: {
    id: 'projectActivity.indirectOverBudget',
    defaultMessage:
      'The overhead line {entity} went over budget: {new} against {old}.',
    description: 'Historial sentence: indirect_budget.over_budget',
  },
  indirectWithinBudget: {
    id: 'projectActivity.indirectWithinBudget',
    defaultMessage:
      'The overhead line {entity} is back within budget: {new} against {old}.',
    description: 'Historial sentence: indirect_budget.within_budget',
  },
  projectWithinBudget: {
    id: 'projectActivity.projectWithinBudget',
    defaultMessage: 'The project is back within budget: {new} against {old}.',
    description: 'Historial sentence: project.within_budget',
  },
  projectCriticalPathChanged: {
    id: 'projectActivity.projectCriticalPathChanged',
    defaultMessage: 'The critical path went from {old} to {new} activities.',
    description:
      'Historial sentence: project.critical_path_changed. One row per recompute — the length, never per-task membership',
  },
  projectCompleted: {
    id: 'projectActivity.projectCompleted',
    defaultMessage: 'Every activity is done — the project is complete.',
    description: 'Historial sentence: project.completed',
  },
  projectArchived: {
    id: 'projectActivity.projectArchived',
    defaultMessage: '{actor} archived the project.',
    description: 'Historial sentence: project.archived',
  },
  projectUnarchived: {
    id: 'projectActivity.projectUnarchived',
    defaultMessage: '{actor} restored the project from the archive.',
    description: 'Historial sentence: project.unarchived',
  },
  taskCompleted: {
    id: 'projectActivity.taskCompleted',
    defaultMessage: '{actor} completed the activity {entity}.',
    description: 'Historial sentence: task.completed',
  },
  taskStatusChanged: {
    id: 'projectActivity.taskStatusChanged',
    defaultMessage: '{actor} moved {entity} from {old} to {new}.',
    description: 'Historial sentence: task.status_changed',
  },
  taskRescheduled: {
    id: 'projectActivity.taskRescheduled',
    defaultMessage: '{actor} rescheduled {entity}: {old} became {new}.',
    description: 'Historial sentence: task.rescheduled',
  },
  taskUnblocked: {
    id: 'projectActivity.taskUnblocked',
    defaultMessage: '{entity} is no longer blocked: it can start.',
    description: 'Historial sentence: task.unblocked',
  },
  taskBlocked: {
    id: 'projectActivity.taskBlocked',
    defaultMessage:
      '{entity} became blocked: it is waiting on work that is not finished.',
    description: 'Historial sentence: task.blocked',
  },
  taskForceStarted: {
    id: 'projectActivity.taskForceStarted',
    defaultMessage:
      '{actor} force-started {entity} while it was still blocked. It stays at risk.',
    description: 'Historial sentence: task.force_started',
  },
  taskForceBlocked: {
    id: 'projectActivity.taskForceBlocked',
    defaultMessage: '{actor} reverted the force start of {entity}.',
    description: 'Historial sentence: task.force_blocked',
  },
  subtaskCompleted: {
    id: 'projectActivity.subtaskCompleted',
    defaultMessage: '{actor} completed the subactivity {entity}.',
    description: 'Historial sentence: subtask.completed',
  },
  subtaskStatusChanged: {
    id: 'projectActivity.subtaskStatusChanged',
    defaultMessage:
      '{actor} moved the subactivity {entity} from {old} to {new}.',
    description: 'Historial sentence: subtask.status_changed',
  },
  subtaskProgressUpdated: {
    id: 'projectActivity.subtaskProgressUpdated',
    defaultMessage:
      '{actor} reported progress on {entity}: {old}% became {new}%.',
    description: 'Historial sentence: subtask.progress_updated',
  },
  subtaskRescheduled: {
    id: 'projectActivity.subtaskRescheduled',
    defaultMessage:
      '{actor} rescheduled the subactivity {entity}: {old} became {new}.',
    description: 'Historial sentence: subtask.rescheduled',
  },
  dependencyCreated: {
    id: 'projectActivity.dependencyCreated',
    defaultMessage: '{actor} made {entity} depend on {old}.',
    description:
      'Historial sentence: dependency.created — entity is the successor, old is the predecessor',
  },
  dependencyUpdated: {
    id: 'projectActivity.dependencyUpdated',
    defaultMessage:
      '{actor} changed how {entity} depends on {old}: it is now {new}.',
    description:
      'Historial sentence: dependency.updated — new carries the PDM notation, e.g. "FS +2d"',
  },
  dependencyRemoved: {
    id: 'projectActivity.dependencyRemoved',
    defaultMessage: '{actor} removed the dependency of {entity} on {old}.',
    description: 'Historial sentence: dependency.removed',
  },
  expenseRecorded: {
    id: 'projectActivity.expenseRecorded',
    defaultMessage: '{actor} recorded the expense {entity} for {new}.',
    description: 'Historial sentence: expense.recorded',
  },

  // --- approval decisions -------------------------------------------------
  // One sentence per act, and it names the target rather than the request:
  // nothing in the product reads the record by request id, and a reader weighs
  // a decision by the obra it lands on. `hasOld` guards the two values that can
  // legitimately be absent — a budget set for the first time has no "before",
  // and a requester whose account is gone has no name to print.
  budgetApprovalRequested: {
    id: 'projectActivity.budgetApprovalRequested',
    defaultMessage:
      '{actor} requested a budget change for {entity}: {hasOld, select, yes {{old} → {new}} other {{new}}}.',
    description:
      'Historial sentence: budget_approval.requested. `old`/`new` are the current and requested amounts',
  },
  budgetApprovalApproved: {
    id: 'projectActivity.budgetApprovalApproved',
    defaultMessage:
      '{actor} approved the budget change for {entity}: {hasOld, select, yes {{old} → {new}} other {{new}}}.',
    description: 'Historial sentence: budget_approval.approved',
  },
  budgetApprovalRejected: {
    id: 'projectActivity.budgetApprovalRejected',
    defaultMessage:
      '{actor} rejected the budget change for {entity}: {hasOld, select, yes {{old} → {new}} other {{new}}}.',
    description:
      'Historial sentence: budget_approval.rejected. The refused amount is still named — a refusal is only readable next to the number that was refused',
  },
  forceStartRequested: {
    id: 'projectActivity.forceStartRequested',
    defaultMessage:
      '{actor} asked to force-start {entity} while it is blocked.',
    description:
      'Historial sentence: force_start.requested. No requester placeholder — the actor already is the requester',
  },
  forceStartApproved: {
    id: 'projectActivity.forceStartApproved',
    defaultMessage:
      '{hasOld, select, yes {{actor} approved the request from {old} to force-start {entity}.} other {{actor} approved the request to force-start {entity}.}}',
    description:
      'Historial sentence: force_start.approved. `old` is who asked; the separate task.force_started row carries the at-risk consequence',
  },
  forceStartRejected: {
    id: 'projectActivity.forceStartRejected',
    defaultMessage:
      '{hasOld, select, yes {{actor} rejected the request from {old} to force-start {entity}.} other {{actor} rejected the request to force-start {entity}.}}',
    description: 'Historial sentence: force_start.rejected',
  },
})

/**
 * Every member of the backend's action enum, with a real sentence. Exhaustive
 * by construction — TypeScript rejects a `ProjectActivityAction` without one.
 */
export const ACTIVITY_ACTION_MESSAGES: Record<
  ProjectActivityAction,
  MessageDescriptor
> = {
  'project.created': activityMessages.projectCreated,
  'project.activated': activityMessages.projectActivated,
  'project.renamed': activityMessages.projectRenamed,
  'project.budget_changed': activityMessages.projectBudgetChanged,
  'project.currency_changed': activityMessages.projectCurrencyChanged,
  'project.location_changed': activityMessages.projectLocationChanged,
  'project.description_changed': activityMessages.projectDescriptionChanged,
  'project.manager_changed': activityMessages.projectManagerChanged,
  'project.member_added': activityMessages.projectMemberAdded,
  'project.member_removed': activityMessages.projectMemberRemoved,
  'task.created': activityMessages.taskCreated,
  'task.deleted': activityMessages.taskDeleted,
  'subtask.created': activityMessages.subtaskCreated,
  'task.completed': activityMessages.taskCompleted,
  'task.status_changed': activityMessages.taskStatusChanged,
  'task.rescheduled': activityMessages.taskRescheduled,
  'task.unblocked': activityMessages.taskUnblocked,
  'task.blocked': activityMessages.taskBlocked,
  'task.force_started': activityMessages.taskForceStarted,
  'task.force_blocked': activityMessages.taskForceBlocked,
  'subtask.completed': activityMessages.subtaskCompleted,
  'subtask.status_changed': activityMessages.subtaskStatusChanged,
  'subtask.progress_updated': activityMessages.subtaskProgressUpdated,
  'subtask.rescheduled': activityMessages.subtaskRescheduled,
  'dependency.created': activityMessages.dependencyCreated,
  'dependency.updated': activityMessages.dependencyUpdated,
  'dependency.removed': activityMessages.dependencyRemoved,
  'expense.recorded': activityMessages.expenseRecorded,
  'risk.created': activityMessages.riskCreated,
  'risk.updated': activityMessages.riskUpdated,
  'risk.closed': activityMessages.riskClosed,
  'task.delayed': activityMessages.taskDelayed,
  'task.recovered': activityMessages.taskRecovered,
  'task.over_budget': activityMessages.taskOverBudget,
  'task.within_budget': activityMessages.taskWithinBudget,
  'project.delayed': activityMessages.projectDelayed,
  'project.recovered': activityMessages.projectRecovered,
  'project.over_budget': activityMessages.projectOverBudget,
  'project.within_budget': activityMessages.projectWithinBudget,
  'indirect_budget.changed': activityMessages.indirectBudgetChanged,
  'indirect_budget.removed': activityMessages.indirectBudgetRemoved,
  'indirect_budget.over_budget': activityMessages.indirectOverBudget,
  'indirect_budget.within_budget': activityMessages.indirectWithinBudget,
  'project.critical_path_changed': activityMessages.projectCriticalPathChanged,
  'project.completed': activityMessages.projectCompleted,
  'project.archived': activityMessages.projectArchived,
  'project.unarchived': activityMessages.projectUnarchived,
  'budget_approval.requested': activityMessages.budgetApprovalRequested,
  'budget_approval.approved': activityMessages.budgetApprovalApproved,
  'budget_approval.rejected': activityMessages.budgetApprovalRejected,
  'force_start.requested': activityMessages.forceStartRequested,
  'force_start.approved': activityMessages.forceStartApproved,
  'force_start.rejected': activityMessages.forceStartRejected,
}

/** The project history's own interface wording. */
export const projectHistoryMessages = defineMessages({
  // History (project-history.tsx)
  historyCaption: {
    id: 'projectDetail.historyCaption',
    defaultMessage:
      'Everything that has happened in this project, newest first.',
    description:
      'Caption of the project History tab — the product’s only record, so there is nothing left to contrast it against',
  },
  historyEmptyTitle: {
    id: 'projectDetail.historyEmptyTitle',
    defaultMessage: 'Nothing recorded yet',
    description: 'Empty state title in the project history',
  },
  historyEmptyDescription: {
    id: 'projectDetail.historyEmptyDescription',
    defaultMessage:
      'Events land here as the project moves: activities completed, delays detected, budget changes.',
    description: 'Empty state body in the project history',
  },
  historyLoadError: {
    id: 'projectDetail.historyLoadError',
    defaultMessage: 'The project history could not be loaded.',
    description: 'Error state of the project History tab',
  },
  historyLoadMore: {
    id: 'projectDetail.historyLoadMore',
    defaultMessage: 'Show more',
    description:
      'Button that loads the next page of the project History timeline',
  },
})
