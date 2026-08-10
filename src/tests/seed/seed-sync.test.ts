/**
 * The anti-drift gate between the frontend fixtures and the backend seed.
 * Set `LENNIX_MS_BK_PATH` to point at a checkout in a location other than the
 * `../lennix-ms-bk` sibling.
 */

import { readFileSync } from 'node:fs'

import {
  seedProject,
  seedTask,
  seedTaskFlags,
  seedUser,
} from '@/tests/fixtures'
import {
  SEED_BROKEN_DEPENDENCY,
  SEED_DEPENDENCIES,
  SEED_EXPENSES,
  SEED_FORCE_START,
  SEED_IDS,
  SEED_ORGANIZATION,
  SEED_PROJECTS,
  SEED_SUBTASK_NOTES,
  SEED_TASKS,
  SEED_USERS,
} from '@/tests/seed'

import { resolveMsBkRoot } from '../../../scripts/seed-sync/extract-seed-facts.mjs'
import {
  buildManifest,
  MANIFEST_PATH,
} from '../../../scripts/seed-sync/sync-seed-manifest.mjs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const taskIds = new Set([
  ...SEED_TASKS.map((task) => task.id),
  SEED_BROKEN_DEPENDENCY.upstream.id,
  SEED_BROKEN_DEPENDENCY.dependent.id,
  SEED_FORCE_START.upstream.id,
  SEED_FORCE_START.forced.id,
])

describe('lennix_pro seed manifest', () => {
  it('exposes every canonical id as a well-formed UUID', () => {
    const ids = Object.entries(SEED_IDS)
    expect(ids.length).toBeGreaterThan(100)
    for (const [name, value] of ids) {
      expect(value, `${name} is not a UUID`).toMatch(UUID)
    }
  })

  it('has no duplicate ids across entity kinds', () => {
    const values = Object.values(SEED_IDS)
    expect(new Set(values).size).toBe(values.length)
  })

  it('keeps every foreign key inside the manifest', () => {
    const userIds = new Set(SEED_USERS.map((user) => user.userId))
    const projectIds = new Set(SEED_PROJECTS.map((project) => project.id))

    expect(userIds.has(SEED_ORGANIZATION.ownerId)).toBe(true)
    for (const member of SEED_ORGANIZATION.members)
      expect(userIds.has(member.userId)).toBe(true)

    for (const project of SEED_PROJECTS) {
      expect(project.organizationId).toBe(SEED_ORGANIZATION.id)
      if (project.managerId) expect(userIds.has(project.managerId)).toBe(true)
      for (const member of project.members)
        expect(userIds.has(member.userId)).toBe(true)
    }

    for (const task of SEED_TASKS) {
      expect(projectIds.has(task.projectId)).toBe(true)
      if (task.parentId) expect(taskIds.has(task.parentId)).toBe(true)
      if (task.assigneeId) expect(userIds.has(task.assigneeId)).toBe(true)
    }

    for (const dependency of SEED_DEPENDENCIES) {
      expect(taskIds.has(dependency.taskId)).toBe(true)
      expect(taskIds.has(dependency.dependsOnId)).toBe(true)
    }

    for (const expense of SEED_EXPENSES) {
      expect(taskIds.has(expense.subtaskId)).toBe(true)
      expect(userIds.has(expense.createdBy)).toBe(true)
    }

    for (const note of SEED_SUBTASK_NOTES) {
      expect(taskIds.has(note.subtaskId)).toBe(true)
      expect(userIds.has(note.authorId)).toBe(true)
    }
  })

  it('carries the demo scenarios the redesign renders', () => {
    // A soft-deleted, incomplete upstream leaves a broken dependency.
    expect(SEED_BROKEN_DEPENDENCY.upstream.deletedAt).not.toBeNull()
    expect(SEED_BROKEN_DEPENDENCY.upstream.status).not.toBe('done')
    expect(SEED_BROKEN_DEPENDENCY.dependent.isBlocked).toBe(true)

    // The force-start override wins over the block and stamps permanent at-risk.
    expect(SEED_FORCE_START.forced.forceStarted).toBe(true)
    expect(SEED_FORCE_START.forced.atRisk).toBe(true)
    expect(SEED_FORCE_START.forced.isBlocked).toBe(false)
    expect(SEED_FORCE_START.request.state).toBe('approved')

    // Three pending import drafts, hidden from the main listing — enough for
    // the Borradores screen to show a quota meter that is not "1 of many".
    expect(SEED_PROJECTS.filter((project) => project.isDraft)).toHaveLength(3)
  })
})

describe('fixtures resolve through the manifest', () => {
  it('reads real seeded entities', () => {
    expect(seedProject(SEED_IDS.PROJECT_TORRE_ID).name).toBe(
      SEED_PROJECTS[0].name,
    )
    expect(seedTask(SEED_IDS.P1_TASK_FOUNDATION).parentId).toBeNull()
    expect(seedUser(SEED_ORGANIZATION.ownerId).email).toContain('@')
    expect(seedTaskFlags(SEED_FORCE_START.forced.id).atRisk).toBe(true)
  })

  it('refuses an id the seed does not contain', () => {
    // The divergence guard: a fixture that drifts onto an invented id fails
    // loudly instead of silently serving data no backend would ever produce.
    expect(() => seedProject('b0000000-0000-0099-0000-000000000000')).toThrow(
      /seed manifest/,
    )
    expect(() => seedTask('c0000000-0099-0099-0000-000000000000')).toThrow(
      /seed manifest/,
    )
  })
})

const msBkRoot = resolveMsBkRoot()

describe.skipIf(!msBkRoot)('manifest vs the live backend seed', () => {
  it('is byte-for-byte what the current seed generates', () => {
    const regenerated = buildManifest(msBkRoot as string)
    const committed = readFileSync(MANIFEST_PATH, 'utf8')
    expect(
      regenerated === committed,
      'The lennix_pro seed changed. Run `pnpm seed:sync`, then update any ' +
        'fixture the change affects.',
    ).toBe(true)
  })
})
