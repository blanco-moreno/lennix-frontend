/**
 * The trash endpoints re-serve soft-deleted rows, so the fixtures here are
 * seed facts wearing the trash shape: the broken-dependency upstream really
 * is deleted in the seed (`deletedAt` is a manifest fact), and the project and
 * expense rows reuse seeded entities with a `FIXTURE_*` deletion stamp.
 */

import { seedProject } from '@/tests/fixtures'
import { SEED_BROKEN_DEPENDENCY, SEED_EXPENSES, SEED_IDS } from '@/tests/seed'

import {
  mapTrashedExpenseDTOToDomain,
  mapTrashedProjectDTOToDomain,
  mapTrashedTaskDTOToDomain,
} from './trash-mapper'

/** Deletion is a runtime event the seed does not stamp for these two rows. */
const FIXTURE_DELETED_AT = '2026-07-24T12:00:00Z'

describe('mapTrashedProjectDTOToDomain', () => {
  it('maps a trashed project field by field', () => {
    const project = seedProject(SEED_IDS.PROJECT_TORRE_ID)
    const dto = {
      id: project.id,
      name: project.name,
      organization_id: project.organizationId,
      deleted_at: FIXTURE_DELETED_AT,
      deleted_by: SEED_IDS.USER_CARLOS_ID,
    }

    const trashed = mapTrashedProjectDTOToDomain(dto)

    expect(trashed.id).toBe(SEED_IDS.PROJECT_TORRE_ID)
    expect(trashed.name).toBe('Torre Residencial Norte')
    expect(trashed.organizationId).toBe(SEED_IDS.ORG_LENNIX_ID)
    expect(trashed.deletedAt).toBe(FIXTURE_DELETED_AT)
    expect(trashed.deletedBy).toBe(SEED_IDS.USER_CARLOS_ID)
  })
})

describe('mapTrashedTaskDTOToDomain', () => {
  it('maps the seed-deleted upstream task (D5/D18)', () => {
    const upstream = SEED_BROKEN_DEPENDENCY.upstream
    const dto = {
      id: upstream.id,
      title: upstream.title,
      project_id: upstream.projectId,
      parent_id: upstream.parentId,
      deleted_at: upstream.deletedAt,
      deleted_by: SEED_IDS.USER_MIGUEL_ID,
    }

    const trashed = mapTrashedTaskDTOToDomain(dto)

    expect(trashed.id).toBe(SEED_IDS.P1_TASK_BROKEN_UPSTREAM)
    expect(trashed.title).toBe(upstream.title)
    expect(trashed.projectId).toBe(SEED_IDS.PROJECT_TORRE_ID)
    expect(trashed.parentId).toBeNull()
    expect(trashed.deletedAt).toBe(upstream.deletedAt)
    expect(trashed.deletedBy).toBe(SEED_IDS.USER_MIGUEL_ID)
  })

  it('keeps null audit fields null', () => {
    const upstream = SEED_BROKEN_DEPENDENCY.upstream

    const trashed = mapTrashedTaskDTOToDomain({
      id: upstream.id,
      title: upstream.title,
      project_id: upstream.projectId,
      parent_id: upstream.parentId,
      deleted_at: null,
      deleted_by: null,
    })

    expect(trashed.deletedAt).toBeNull()
    expect(trashed.deletedBy).toBeNull()
  })
})

describe('mapTrashedExpenseDTOToDomain', () => {
  it('maps a trashed expense from a seeded row', () => {
    const expense = SEED_EXPENSES[0]
    const dto = {
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      subtask_id: expense.subtaskId,
      deleted_at: FIXTURE_DELETED_AT,
      deleted_by: expense.createdBy,
    }

    const trashed = mapTrashedExpenseDTOToDomain(dto)

    expect(trashed.id).toBe(expense.id)
    expect(trashed.description).toBe('Mano de obra excavacion')
    // The trash surface keeps the wire string — no money conversion here.
    expect(trashed.amount).toBe(expense.amount)
    expect(trashed.subtaskId).toBe(SEED_IDS.P1_SUB_EXCAVATION)
    expect(trashed.deletedAt).toBe(FIXTURE_DELETED_AT)
    expect(trashed.deletedBy).toBe(expense.createdBy)
  })
})
