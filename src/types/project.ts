/**
 * Project domain types — matches the backend contract for /v1/projects.
 */

import type { RoleSlug } from '@/utils'

import type { ReviewStep } from './schedule-import'

export interface ProjectMember {
  id: number
  userId: string
  memberName: string | null
  memberEmail: string | null
  /**
   * Whether this row leads the obra.
   *
   * A project has exactly one manager — `Project.managerId` — and the backend
   * states which member it is rather than making every client re-derive it by
   * matching ids across two responses. The manager is a member by construction
   * and their row cannot be removed: the handover on the project form is what
   * frees it.
   */
  isManager: boolean
  joinedAt: string
}

/**
 * Who the obra accepts, one list for the two assignment fields.
 *
 * Not the roster: every member of the organization is offered, because naming a
 * jefe de obra seats whoever is named. `isWorkAssignable` is the narrower set —
 * an activity or subactivity assignee — and a picker for that field must filter
 * on it or the write 400s. `isProjectMember` false is what makes the picker
 * badge the row with `roleSlug`, so choosing one is an informed choice.
 */
export interface AssignableMember {
  userId: string
  memberName: string
  memberEmail: string
  /** `null` for a slug this build does not know — the row still lists, unbadged. */
  roleSlug: RoleSlug | null
  isProjectMember: boolean
  /** Whether the obra also accepts them as an activity assignee. */
  isWorkAssignable: boolean
}

/**
 * The obra's verdict — the ONE thing the UI colours a project from.
 *
 * Nine levels, closed and already tie-broken by the backend. The client's whole
 * job is a lookup: `healthTone(level)`. Anything that reads a second field to
 * decide a colour is re-introducing the bug this replaced, where the same obra
 * was amber on the home and green in the listing.
 */
export type ProjectHealthLevel =
  | 'draft'
  | 'completed'
  | 'archived'
  | 'critical'
  | 'delayed'
  | 'overdue'
  | 'over_budget'
  | 'ahead'
  | 'on_track'

export interface ProjectHealth {
  level: ProjectHealthLevel
  /** The engine's worst slip on the project. */
  delayDays: number
  /** Days past the due date; 0 when the date says nothing about this project. */
  daysOverdue: number
}

export interface Project {
  id: string
  organizationId: string
  name: string
  description: string | null
  location: string | null
  status: ProjectStatus
  priority: ProjectPriority
  budget: number | null
  managerId: string | null
  managerName: string | null
  isDraft: boolean
  progress: number
  startDate: string | null
  dueDate: string | null
  allocated: number
  spent: number
  isOverBudget: boolean
  createdAt: string
  health: ProjectHealth
  /** Where the import wizard was left. Advisory, and null on a live obra. */
  reviewStep: ReviewStep | null
}

export interface ProjectDetail extends Project {
  members: ProjectMember[]
}

/**
 * The Historial's vocabulary — mirrors `ProjectActivityAction` in
 * `lennix-ms-bk/app/projects/constants.py`.
 *
 * These keys are contract. Every one of them must map to a translated sentence
 * in `project-activity-messages.ts`; the `Record` over this union makes a
 * missing one a type error rather than a blank row.
 */
export const PROJECT_ACTIVITY_ACTIONS = [
  // The obra itself, not only its tasks.
  'project.created',
  'project.activated',
  'project.renamed',
  'project.budget_changed',
  'project.location_changed',
  'project.description_changed',
  'project.manager_changed',
  'project.member_added',
  'project.member_removed',
  'task.created',
  'task.deleted',
  'subtask.created',
  'task.completed',
  'task.status_changed',
  'task.rescheduled',
  'task.unblocked',
  'task.blocked',
  'task.force_started',
  'task.force_blocked',
  'subtask.completed',
  'subtask.status_changed',
  'subtask.progress_updated',
  'subtask.rescheduled',
  'dependency.created',
  'dependency.updated',
  'dependency.removed',
  'expense.recorded',
  // The risk register — the one family here raised by a person rather
  // than by a recalculation.
  'risk.created',
  'risk.updated',
  'risk.closed',
  // Derived state, recorded as CROSSINGS. Delay and budget are per task because
  // "Excavación se atrasó" is actionable; the critical path is per project
  // because its membership churns — one edit would flip dozens of tasks.
  'task.delayed',
  'task.recovered',
  'task.over_budget',
  'task.within_budget',
  'project.delayed',
  'project.recovered',
  'project.over_budget',
  'project.within_budget',
  'project.critical_path_changed',
  'project.completed',
  'project.archived',
  'project.unarchived',
  // Approval decisions. The only family whose prefix is not
  // its `entityType`: a budget request can target the obra, an activity or a
  // subactivity and all three read as the same act, so the key names the
  // DECISION while `entityType` says what it was about.
  'budget_approval.requested',
  'budget_approval.approved',
  'budget_approval.rejected',
  'force_start.requested',
  'force_start.approved',
  'force_start.rejected',
] as const

export type ProjectActivityAction = (typeof PROJECT_ACTIVITY_ACTIONS)[number]

/** Mirrors `ProjectActivityEntity` — what a Historial row is about. */
export type ProjectActivityEntity =
  | 'project'
  | 'task'
  | 'subtask'
  | 'dependency'
  | 'expense'
  | 'risk'

/**
 * One entry of the project Historial.
 *
 * The project's own record, identical for everyone who can open the obra —
 * not the viewer's notification inbox. It carries structured fields and no
 * prose, so the sentence is composed and translated here.
 */
export interface ProjectActivity {
  id: string
  occurredAt: string
  actorId: string | null
  /** Null for a system-generated change (a cascade, a recomputation). */
  actorName: string | null
  action: ProjectActivityAction
  entityType: ProjectActivityEntity
  entityId: string | null
  entityName: string | null
  oldValue: string | null
  newValue: string | null
}

export interface ProjectBudget {
  projectId: string
  budget: number | null
  allocated: number
  unallocated: number
  spent: number
  remaining: number
  isOverBudget: boolean
  utilizationPercentage: number
}

export type ProjectStatus =
  | 'on_track'
  | 'delayed'
  | 'ahead'
  | 'completed'
  | 'archived'

export type ProjectPriority = 'low' | 'medium' | 'high'

/**
 * Sort keys `GET /v1/projects` accepts — mirrors `ProjectSortBy` in
 * `lennix-ms-bk/app/projects/constants.py`, where a leading `-` means
 * descending. A key the backend does not know is a 422, so this union is
 * contract and not a convenience.
 */
export type ProjectSortBy =
  | 'created_at'
  | '-created_at'
  | 'name'
  | '-name'
  | 'due_date'
  | '-due_date'
  // Both sort by a computed order, not by the stored string: priority ranks
  // low < medium < high (domain severity, not alphabetical), and progress is
  // the 0-100 roll-up the server derives per obra.
  | 'priority'
  | '-priority'
  | 'progress'
  | '-progress'

/** What `POST /v1/projects/{id}/export` hands back: the workbook and the name the backend gave it. */
export interface ScheduleExportFile {
  blob: Blob
  filename: string
}
