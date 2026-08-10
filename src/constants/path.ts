export const PATHS = {
  LOGIN: '/login',

  HOME: '/',
  DASHBOARD: '/dashboard',
  // One approvals home: budget changes and force-start overrides are
  // both "a decision someone is waiting on", so they share a bandeja instead of
  // two menu entries that each look like the whole inbox.
  APPROVALS: '/approvals',
  TRASH: '/trash',

  PROJECTS: '/projects',
  PROJECT_IMPORT: '/projects/import',
  PROJECT_DETAIL: '/projects/:projectId',
  // A task is a page inside its project's address space, so the URL
  // itself says whose schedule it belongs to.
  TASK_DETAIL: '/projects/:projectId/tasks/:taskId',

  // Drafts have their own home and their own resumable canvas:
  // a draft is never project-detail, and the review is addressed by its id so
  // it can be picked up days later.
  DRAFTS: '/drafts',
  DRAFT_REVIEW: '/drafts/:projectId/review',
  // Lane F: a diverted upload lands no draft, so it is addressed by its job.
  IMPORT_ASSISTED_MAPPING: '/imports/:jobId/mapping',

  TASKS: '/tasks',

  // One settings home: the account and the organization are sections of it,
  // not two routes.
  SETTINGS: '/settings',
  TEAM_MANAGEMENT: '/settings/team',
} as const
