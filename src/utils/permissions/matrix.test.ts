import { can, PERMISSION_KEYS, type Permission } from './matrix'
import { ROLE_SLUGS, type RoleSlug } from './roles'

/**
 * `matrix.ts` is a hand-kept mirror of `app/permissions/matrix.py` in
 * `lennix-ms-bk` — there is no codegen, so this file is the sync check. Two
 * things are pinned: **key parity** (the exact list of permissions the server
 * gates) and **the cells** (which roles hold each one). A drift on either side
 * puts a button in front of a role the server answers 403 to, or hides one it
 * allows.
 */

/**
 * Every `Permission` in `app/permissions/matrix.py`, in its order. Copied by
 * hand on purpose: a diff here is the reviewer's signal that the server's
 * vocabulary moved.
 */
const SERVER_PERMISSIONS = [
  'dashboard.view',
  'project.list.viewAll',
  'project.create',
  'project.tabs.budget.view',
  'project.tabs.dependencies.view',
  'project.dependencies.manage',
  'project.tabs.criticalPaths.view',
  'project.tabs.risks.view',
  'project.risks.manage',
  'project.edit',
  'project.delete',
  'project.changePriority',
  'project.team.manage',
  'project.manager.assign',
  'task.create',
  'task.delete',
  'task.registerProgress',
  'task.tabs.budget.view',
  'task.expenses.write',
  'task.edit',
  'org.team.manage',
  'user.role.manage',
  'organization.settings.manage',
  'organization.ownership.transfer',
  'budget.edit.direct',
  'budget.edit.request',
  'budget.approval.decide',
  'forceStart.direct',
  'forceStart.request',
  'forceStart.approval.decide',
  'trash.view',
  'trash.restore',
  'trash.purge',
] as const satisfies readonly Permission[]

const ORGANIZATION_WIDE: RoleSlug[] = ['owner', 'admin']
const LEADERSHIP: RoleSlug[] = ['owner', 'admin', 'manager']

/** Assert a permission is held by exactly these roles and no others. */
function expectExactly(permission: Permission, holders: RoleSlug[]) {
  for (const role of ROLE_SLUGS) {
    expect({ permission, role, can: can(role, permission) }).toEqual({
      permission,
      role,
      can: holders.includes(role),
    })
  }
}

describe('parity with app/permissions/matrix.py', () => {
  it('gates the exact same set of permissions the server does', () => {
    expect([...PERMISSION_KEYS].sort()).toEqual([...SERVER_PERMISSIONS].sort())
  })

  it('names the four roles of the hierarchy', () => {
    expect([...ROLE_SLUGS]).toEqual(['owner', 'admin', 'manager', 'user'])
  })
})

describe('can()', () => {
  it('returns false for a null role on every permission', () => {
    for (const permission of PERMISSION_KEYS) {
      expect(can(null, permission)).toBe(false)
    }
  })

  // Two rows the organization-wide roles deliberately lack. Neither is a lesser
  // grant: they are the "ask instead of do" keys that only a `user` holds.
  const NOT_FOR_LEADERSHIP: Permission[] = [
    'budget.edit.request',
    'forceStart.request',
  ]

  it('grants the owner every action except the member-only rows', () => {
    for (const permission of PERMISSION_KEYS) {
      expect({ permission, can: can('owner', permission) }).toEqual({
        permission,
        can: !NOT_FOR_LEADERSHIP.includes(permission),
      })
    }
  })

  it('grants the admin the same, minus transferring ownership', () => {
    for (const permission of PERMISSION_KEYS) {
      expect({ permission, can: can('admin', permission) }).toEqual({
        permission,
        can:
          !NOT_FOR_LEADERSHIP.includes(permission) &&
          permission !== 'organization.ownership.transfer',
      })
    }
  })
})

describe('scope: who sees the whole organization', () => {
  it('limits "view all projects" to owner and admin', () => {
    expectExactly('project.list.viewAll', ORGANIZATION_WIDE)
  })

  it('gives the manager the dashboard, scoped by the backend', () => {
    // Same screen, narrower aggregates: without `project.list.viewAll` the
    // server already filters them to the obras the manager belongs to.
    expectExactly('dashboard.view', LEADERSHIP)
    expect(can('manager', 'project.list.viewAll')).toBe(false)
  })

  it('keeps the papelera with the roles that delete', () => {
    for (const action of [
      'project.delete',
      'trash.view',
      'trash.restore',
      'trash.purge',
    ] as const) {
      expectExactly(action, ORGANIZATION_WIDE)
    }
  })
})

describe('what a manager may do that a user may not', () => {
  it('lets the leadership roles create an obra (import included)', () => {
    expectExactly('project.create', LEADERSHIP)
  })

  it('lets the leadership roles staff an obra they belong to', () => {
    // Adding somebody already in the company. Bringing a new person in is
    // `org.team.manage`, which the manager does not hold.
    expectExactly('project.team.manage', LEADERSHIP)
    expectExactly('org.team.manage', ORGANIZATION_WIDE)
  })

  it('leaves everything else on the obra identical for both', () => {
    for (const action of [
      'project.edit',
      'project.changePriority',
      'project.manager.assign',
      'project.tabs.budget.view',
      'project.tabs.dependencies.view',
      'project.dependencies.manage',
      'project.tabs.criticalPaths.view',
      'project.tabs.risks.view',
      'project.risks.manage',
      'task.create',
      'task.delete',
      'task.edit',
      'task.registerProgress',
      'task.tabs.budget.view',
      'task.expenses.write',
    ] as const) {
      expect({ action, manager: can('manager', action) }).toEqual({
        action,
        manager: can('user', action),
      })
      expect(can('user', action)).toBe(true)
    }
  })
})

describe('approvals: whoever decides never asks', () => {
  it('splits the budget flow between deciders and the user', () => {
    expectExactly('budget.edit.direct', LEADERSHIP)
    expectExactly('budget.approval.decide', LEADERSHIP)
    expectExactly('budget.edit.request', ['user'])
  })

  it('splits the force-start flow the same way', () => {
    // Its own keys, not a reuse of the budget ones: the server enforces
    // `forceStart.*` separately, and gating the UI on the wrong key produces
    // buttons that 403.
    expectExactly('forceStart.direct', LEADERSHIP)
    expectExactly('forceStart.approval.decide', LEADERSHIP)
    expectExactly('forceStart.request', ['user'])
  })

  it('makes self-approval impossible by construction', () => {
    // Nobody both asks and decides — that is the whole point of the split.
    for (const role of ROLE_SLUGS) {
      expect(
        can(role, 'budget.edit.request') && can(role, 'budget.approval.decide'),
      ).toBe(false)
      expect(
        can(role, 'forceStart.request') &&
          can(role, 'forceStart.approval.decide'),
      ).toBe(false)
    }
  })
})

describe('organization administration', () => {
  it('keeps settings and role grants with owner and admin', () => {
    expectExactly('organization.settings.manage', ORGANIZATION_WIDE)
    // *Which* role each may grant is a service rule (only the owner grants
    // `admin`), not a cell — the matrix only ever sees the actor's role.
    expectExactly('user.role.manage', ORGANIZATION_WIDE)
  })

  it('is the only cell where owner and admin differ', () => {
    expectExactly('organization.ownership.transfer', ['owner'])
    const differing = PERMISSION_KEYS.filter(
      (permission) => can('owner', permission) !== can('admin', permission),
    )
    expect(differing).toEqual(['organization.ownership.transfer'])
  })
})
