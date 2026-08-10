/**
 * The rows a scenario names, resolved from the seed manifest instead of typed
 * into a test. A hard-coded UUID here would be the one place demo data stops
 * following `pnpm seed:sync`.
 */

import { SEED_PROJECTS, SEED_TASKS } from '../../src/tests/seed'

export function projectIdByName(name: string): string {
  const project = SEED_PROJECTS.find((row) => row.name === name)
  if (!project) throw new Error(`No seeded project named "${name}"`)
  return project.id
}

/** The main activities of an obra, in seed order — what its schedule shows. */
export function mainActivitiesOf(projectName: string): string[] {
  const projectId = projectIdByName(projectName)
  return SEED_TASKS.filter(
    (row) => row.projectId === projectId && row.parentId === null,
  ).map((row) => row.title)
}

/** The blocked main activity of an obra — what force-start is about. */
export function blockedTaskIdOf(projectName: string): string {
  const projectId = projectIdByName(projectName)
  const task = SEED_TASKS.find(
    (row) =>
      row.projectId === projectId && row.parentId === null && row.isBlocked,
  )
  if (!task) throw new Error(`No blocked main activity in "${projectName}"`)
  return task.id
}
