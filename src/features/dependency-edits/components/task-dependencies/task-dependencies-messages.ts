import { defineMessages } from 'react-intl'

/**
 * Site language for the dependency graph. "Predecessor" and "successor" are
 * planner words; a foreman reads what waits for what.
 */
export const taskDependenciesMessages = defineMessages({
  pivotLevelTask: {
    id: 'taskDependencies.pivotLevelTask',
    defaultMessage: 'Main activity',
    description:
      'Level badge on the pivot card — the row every edge on the page is about',
  },
  pivotLevelSubtask: {
    id: 'taskDependencies.pivotLevelSubtask',
    defaultMessage: 'Subactivity',
    description: 'Level badge on the pivot card, lower level',
  },
  timeline: {
    id: 'taskDependencies.timeline',
    defaultMessage: 'On the calendar',
    description:
      'Heading of the mini Gantt that draws the chain: predecessors, this row, successors',
  },
  waitsFor: {
    id: 'taskDependencies.waitsFor',
    defaultMessage: 'Waits for ({count})',
    description: 'Predecessors: what has to happen before this row can run',
  },
  waitsForEmpty: {
    id: 'taskDependencies.waitsForEmpty',
    defaultMessage: 'Nothing is holding this one back.',
    description: 'Empty predecessors list',
  },
  blocks: {
    id: 'taskDependencies.blocks',
    defaultMessage: 'Blocks ({count})',
    description: 'Successors: what cannot run until this row does',
  },
  blocksEmpty: {
    id: 'taskDependencies.blocksEmpty',
    defaultMessage: 'Nothing is waiting on this one.',
    description: 'Empty successors list',
  },
  emptyTitle: {
    id: 'taskDependencies.emptyTitle',
    defaultMessage: 'No dependencies',
    description: 'Empty state title when the row has no links either way',
  },
  emptyDescription: {
    id: 'taskDependencies.emptyDescription',
    defaultMessage:
      'Nothing has to finish before this one, and nothing is waiting on it. Until it is linked it stays off the critical path and no delay reaches it.',
    description:
      'Empty state body when the row has no links either way — it says what the absence costs, since that is the reason to fix it',
  },
  emptyAction: {
    id: 'taskDependencies.emptyAction',
    defaultMessage: 'Add the first link',
    description: 'Empty state button, opens the composer on the predecessors',
  },
  broken: {
    id: 'taskDependencies.broken',
    defaultMessage:
      '{count, plural, one {# broken link} other {# broken links}} on this one — re-link it on the schedule, where the replacement rows are.',
    description:
      'Points at the schedule for the repair: a broken edge has no predecessor left, so fixing it needs the whole WBS to pick from',
  },
})
