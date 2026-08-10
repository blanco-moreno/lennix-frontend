import { type RoleSlug } from './roles'

/**
 * Permission matrix over the **system role** layer (`auth_user.role_id`) — the
 * client-side mirror of `app/permissions/matrix.py` in `lennix-ms-bk`. Both
 * sides must list the exact same permissions per role (manual sync, no codegen;
 * `matrix.test.ts` pins the parity).
 *
 * The matrix answers **what** a role may do; membership answers **where**:
 * `owner`/`admin` act organization-wide, `manager`/`user` only on the obras
 * they belong to. That second gate lives on the server — nothing here narrows
 * a grant to "if member", because the UI reflects permissions, it does not
 * enforce them.
 */
export type Permission =
  // A1 — Dashboard
  | 'dashboard.view'

  // A2 — Projects listing
  // Its absence is what scopes a listing to the caller's obras (the server
  // narrows it); there is no "view assigned" grant.
  | 'project.list.viewAll'

  // A3 — Project create (schedule import included)
  | 'project.create'

  // A4 — Project detail tabs
  | 'project.tabs.budget.view'
  | 'project.tabs.dependencies.view'
  | 'project.dependencies.manage'
  | 'project.tabs.criticalPaths.view'
  | 'project.tabs.risks.view'
  | 'project.risks.manage'

  // A5 — Project actions
  | 'project.edit'
  | 'project.delete'
  | 'project.changePriority'

  // A6 — Project team management
  | 'project.team.manage'
  | 'project.manager.assign'

  // A7 — Activities
  | 'task.create'
  | 'task.delete'
  | 'task.registerProgress'

  // A8 — Activity detail. There is no separate expenses-tab permission: the
  // expenses tab is nested inside the budget tab and granted to the same roles.
  | 'task.tabs.budget.view'
  | 'task.expenses.write'
  | 'task.edit'

  // A9 — Organization-level administration
  | 'org.team.manage'
  | 'user.role.manage'
  | 'organization.settings.manage'
  | 'organization.ownership.transfer'

  // B — Budget approval flow
  | 'budget.edit.direct'
  | 'budget.edit.request'
  | 'budget.approval.decide'

  // F — Force-start approval flow
  | 'forceStart.direct'
  | 'forceStart.request'
  | 'forceStart.approval.decide'

  // Trash / papelera
  | 'trash.view'
  | 'trash.restore'
  | 'trash.purge'

type Matrix = Record<Permission, ReadonlyArray<RoleSlug>>

// The role sets the matrix is built from, named exactly as in `matrix.py`, so
// "who acts organization-wide" stays a single edit on both sides.
const ORGANIZATION_WIDE_ROLES = ['owner', 'admin'] as const
const LEADERSHIP_ROLES = ['owner', 'admin', 'manager'] as const
const EVERY_ROLE = ['owner', 'admin', 'manager', 'user'] as const

/**
 * Single source of truth. Each row lists the roles that are allowed
 * to perform the action. Anything not on the list is denied.
 */
const PERMISSION_MATRIX: Matrix = {
  // The manager's dashboard is the same dashboard, scoped: without
  // `project.list.viewAll` the backend aggregates already narrow to their obras.
  'dashboard.view': LEADERSHIP_ROLES,

  'project.list.viewAll': ORGANIZATION_WIDE_ROLES,

  // No project exists yet to check membership against, so the role alone
  // decides; the creator becomes a member of it at once.
  'project.create': LEADERSHIP_ROLES,

  'project.tabs.budget.view': EVERY_ROLE,
  'project.tabs.dependencies.view': EVERY_ROLE,
  'project.dependencies.manage': EVERY_ROLE,
  'project.tabs.criticalPaths.view': EVERY_ROLE,
  'project.tabs.risks.view': EVERY_ROLE,
  'project.risks.manage': EVERY_ROLE,

  'project.edit': EVERY_ROLE,
  // Deleting is paired with the papelera: whoever deletes must be able to
  // restore, and the papelera belongs to the organization-wide roles.
  'project.delete': ORGANIZATION_WIDE_ROLES,
  'project.changePriority': EVERY_ROLE,

  // Adding somebody already in the organization to an obra. Bringing a new
  // person into the company is `org.team.manage`, which the manager lacks.
  'project.team.manage': LEADERSHIP_ROLES,
  'project.manager.assign': EVERY_ROLE,

  'task.create': EVERY_ROLE,
  'task.delete': EVERY_ROLE,
  'task.registerProgress': EVERY_ROLE,
  'task.tabs.budget.view': EVERY_ROLE,
  'task.expenses.write': EVERY_ROLE,
  'task.edit': EVERY_ROLE,

  'org.team.manage': ORGANIZATION_WIDE_ROLES,
  'organization.settings.manage': ORGANIZATION_WIDE_ROLES,
  // Which role each of the two may grant is a service rule, not a cell: it
  // depends on the value asked for, which the matrix never sees. Only the
  // owner grants `admin` (D-D).
  'user.role.manage': ORGANIZATION_WIDE_ROLES,
  'organization.ownership.transfer': ['owner'],

  // Budget: whoever can decide edits directly, so self-approval cannot arise.
  'budget.edit.direct': LEADERSHIP_ROLES,
  'budget.edit.request': ['user'],
  'budget.approval.decide': LEADERSHIP_ROLES,

  // Force-start mirrors budget exactly: approvers force directly, the `user`
  // asks. These are their own keys, not a reuse of the budget ones — the
  // server enforces them separately.
  'forceStart.direct': LEADERSHIP_ROLES,
  'forceStart.request': ['user'],
  'forceStart.approval.decide': LEADERSHIP_ROLES,

  'trash.view': ORGANIZATION_WIDE_ROLES,
  'trash.restore': ORGANIZATION_WIDE_ROLES,
  'trash.purge': ORGANIZATION_WIDE_ROLES,
}

/**
 * Does the given role have the given permission?
 *
 * Returns `false` for `null` roles (logged-out or unknown role id) so
 * unauthenticated UI fragments hide everything by default.
 */
export function can(role: RoleSlug | null, permission: Permission): boolean {
  if (role === null) return false
  return PERMISSION_MATRIX[permission].includes(role)
}

/** Every permission the matrix knows, for the parity test against `matrix.py`. */
export const PERMISSION_KEYS = Object.keys(PERMISSION_MATRIX) as Permission[]
