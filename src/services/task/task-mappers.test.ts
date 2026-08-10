import {
  DEFAULT_SEED_PROJECT_ID,
  DEFAULT_SEED_SUBTASK_ID,
  DEFAULT_SEED_TASK_ID,
  seedAssignedSubtaskListDTO,
  seedForceStartedTaskDTO,
  seedSubtaskDTO,
  seedSubtaskListDTO,
  seedTask,
  seedTaskDTO,
  seedTaskListDTO,
} from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'
import type { AssignedSubtaskResponseDTO } from '@/types/dto/subtask-dto'

import {
  mapAssignedSubtaskDTO,
  mapPageOfAssignedSubtasks,
  mapPageOfTasks,
  mapSubtaskDTOArrayToSubtasks,
  mapSubtaskDTOToSubtask,
  mapTaskDTOArrayToTasks,
  mapTaskDTOToTask,
  readSubtaskBlockedFailure,
} from './task-mappers'

describe('mapSubtaskDTOToSubtask', () => {
  it('maps snake_case → camelCase on every field', () => {
    const dto = seedSubtaskDTO(DEFAULT_SEED_SUBTASK_ID)

    const subtask = mapSubtaskDTOToSubtask(dto)

    expect(subtask.id).toBe(DEFAULT_SEED_SUBTASK_ID)
    expect(subtask.parentId).toBe(DEFAULT_SEED_TASK_ID)
    expect(subtask.title).toBe(dto.title)
    expect(subtask.description).toBe(dto.description)
    expect(subtask.status).toBe(dto.status)
    expect(subtask.priority).toBe(dto.priority)
    expect(subtask.progress).toBe(dto.progress)
    expect(subtask.startDate).toBe(dto.start_date)
    expect(subtask.dueDate).toBe(dto.due_date)
    expect(subtask.location).toBe(dto.location)
    expect(subtask.assigneeId).toBe(dto.assignee_id)
    expect(subtask.assigneeName).toBe(dto.assignee_name)
    expect(subtask.delayReason).toBe(dto.delay_reason)
    expect(subtask.delayDays).toBe(dto.delay_days)
    expect(subtask.isBlocked).toBe(dto.is_blocked)
    expect(subtask.isCriticalPath).toBe(dto.is_critical_path)
    expect(subtask.forceStarted).toBe(dto.force_started)
    expect(subtask.atRisk).toBe(dto.at_risk)
    // The mirror-subtask flag survives the live mapper, not only the review path.
    expect(subtask.systemGenerated).toBe(dto.system_generated)
    expect(subtask.createdAt).toBe(dto.created_at)
  })

  it('parses the decimal-string spent into a number', () => {
    const dto = seedSubtaskDTO(DEFAULT_SEED_SUBTASK_ID)

    expect(mapSubtaskDTOToSubtask(dto).spent).toBe(Number(dto.spent))
  })

  it('degrades an unparsable spent to 0 instead of NaN', () => {
    const dto = seedSubtaskDTO(DEFAULT_SEED_SUBTASK_ID, { spent: 'oops' })

    expect(mapSubtaskDTOToSubtask(dto).spent).toBe(0)
  })
})

describe('mapTaskDTOToTask', () => {
  it('maps the seeded Cimentacion phase field by field', () => {
    const dto = seedTaskDTO(DEFAULT_SEED_TASK_ID)

    const task = mapTaskDTOToTask(dto)

    expect(task.id).toBe(DEFAULT_SEED_TASK_ID)
    expect(task.projectId).toBe(DEFAULT_SEED_PROJECT_ID)
    expect(task.projectName).toBe('Torre Residencial Norte')
    expect(task.title).toBe('Cimentacion')
    // Pin the seed facts, so a swapped status/priority mapping fails loudly.
    expect(task.status).toBe('in_progress')
    expect(task.priority).toBe('high')
    expect(task.budget).toBe(208000)
    expect(task.spent).toBe(175000)
    expect(task.progress).toBe(dto.progress)
    expect(task.startDate).toBe(dto.start_date)
    expect(task.dueDate).toBe(dto.due_date)
    expect(task.isOverBudget).toBe(dto.is_over_budget)
    expect(task.delayReason).toBe(dto.delay_reason)
    expect(task.delayDays).toBe(dto.delay_days)
    expect(task.isDraft).toBe(dto.is_draft)
    expect(task.isBlocked).toBe(dto.is_blocked)
    expect(task.isCriticalPath).toBe(dto.is_critical_path)
    expect(task.assigneeId).toBe(dto.assignee_id)
    expect(task.assigneeName).toBe(dto.assignee_name)
    expect(task.createdAt).toBe(dto.created_at)
  })

  it('maps nested subtasks through the subtask mapper', () => {
    const dto = seedTaskDTO(DEFAULT_SEED_TASK_ID)

    const task = mapTaskDTOToTask(dto)

    expect(task.subtasks).toHaveLength(dto.subtasks.length)
    expect(task.subtasks.length).toBeGreaterThan(0)
    task.subtasks.forEach((subtask, idx) => {
      expect(subtask.id).toBe(dto.subtasks[idx].id)
      expect(subtask.parentId).toBe(DEFAULT_SEED_TASK_ID)
      expect(subtask.title).toBe(dto.subtasks[idx].title)
    })
  })

  it('keeps a null budget null rather than coercing it to 0', () => {
    const dto = seedTaskDTO(DEFAULT_SEED_TASK_ID, { budget: null })

    expect(mapTaskDTOToTask(dto).budget).toBeNull()
  })

  it('carries the D24 force-start provenance flags', () => {
    const task = mapTaskDTOToTask(seedForceStartedTaskDTO())

    expect(task.forceStarted).toBe(true)
    expect(task.atRisk).toBe(true)
    expect(task.isBlocked).toBe(false)
  })
})

describe('array and page mappers', () => {
  it('maps a task array one to one', () => {
    const dtos = seedTaskListDTO(DEFAULT_SEED_PROJECT_ID)

    const tasks = mapTaskDTOArrayToTasks(dtos)

    expect(tasks).toHaveLength(dtos.length)
    expect(tasks.map((task) => task.id)).toEqual(dtos.map((dto) => dto.id))
  })

  it('maps a subtask array one to one', () => {
    const dtos = seedSubtaskListDTO(DEFAULT_SEED_TASK_ID)

    const subtasks = mapSubtaskDTOArrayToSubtasks(dtos)

    expect(subtasks).toHaveLength(dtos.length)
    expect(subtasks.map((s) => s.id)).toEqual(dtos.map((dto) => dto.id))
  })

  it('maps the page envelope fields, not just the items', () => {
    const items = seedTaskListDTO(DEFAULT_SEED_PROJECT_ID)

    const page = mapPageOfTasks({
      items,
      total: 12,
      page: 2,
      page_size: 5,
      total_pages: 3,
    })

    expect(page.items).toHaveLength(items.length)
    expect(page.items[0].projectId).toBe(DEFAULT_SEED_PROJECT_ID)
    expect(page.total).toBe(12)
    expect(page.page).toBe(2)
    expect(page.pageSize).toBe(5)
    expect(page.totalPages).toBe(3)
  })
})

describe('mapAssignedSubtaskDTO', () => {
  it('adds the context fields on top of the subtask shape', () => {
    const dtos = seedAssignedSubtaskListDTO()
    expect(dtos.length).toBeGreaterThan(0)
    const dto = dtos[0]

    const activity = mapAssignedSubtaskDTO(dto)

    expect(activity.id).toBe(dto.id)
    expect(activity.title).toBe(dto.title)
    expect(activity.spent).toBe(Number(dto.spent))
    expect(activity.projectId).toBe(dto.project_id)
    expect(activity.projectName).toBe(dto.project_name)
    expect(activity.parentTitle).toBe(dto.parent_title)
  })

  it('carries a first-level activity through with no parent at all', () => {
    // The seed has one: an activity assigned at its own level, so the queue's
    // null `parent_id`/`parent_title` must survive the mapper rather than be
    // filled in with a placeholder.
    const dto = seedAssignedSubtaskListDTO().find(
      (row) => row.parent_id === null,
    )
    expect(dto).toBeDefined()

    const activity = mapAssignedSubtaskDTO(dto as AssignedSubtaskResponseDTO)

    expect(activity.parentId).toBeNull()
    expect(activity.parentTitle).toBeNull()
  })

  it('maps the assigned-activities page envelope', () => {
    const items = seedAssignedSubtaskListDTO()

    const page = mapPageOfAssignedSubtasks({
      items,
      total: items.length,
      page: 1,
      page_size: 25,
      total_pages: 1,
    })

    expect(page.items).toHaveLength(items.length)
    expect(page.items[0].parentTitle).toBe(items[0].parent_title)
    expect(page.pageSize).toBe(25)
    expect(page.totalPages).toBe(1)
  })
})

describe('readSubtaskBlockedFailure', () => {
  const blockedError = () => ({
    status: 400,
    data: {
      detail: {
        code: 'subtask_blocked',
        blocked_by: [
          {
            id: SEED_IDS.P1_TASK_FOUNDATION,
            title: seedTask(SEED_IDS.P1_TASK_FOUNDATION).title,
          },
        ],
      },
    },
  })

  it('reads the structured refusal with its predecessors by name', () => {
    const failure = readSubtaskBlockedFailure(blockedError())

    expect(failure).toEqual({
      blockedBy: [{ id: SEED_IDS.P1_TASK_FOUNDATION, title: 'Cimentacion' }],
    })
  })

  it('returns an empty blockedBy for a broken-edge block (D5/D18)', () => {
    const error = blockedError()
    error.data.detail.blocked_by = []

    expect(readSubtaskBlockedFailure(error)).toEqual({ blockedBy: [] })
  })

  it('tolerates a missing or non-array blocked_by', () => {
    const error = blockedError() as {
      status: number
      data: { detail: { code: string; blocked_by?: unknown } }
    }
    error.data.detail.blocked_by = 'not a list'

    expect(readSubtaskBlockedFailure(error)).toEqual({ blockedBy: [] })

    delete error.data.detail.blocked_by
    expect(readSubtaskBlockedFailure(error)).toEqual({ blockedBy: [] })
  })

  it('drops malformed blocked_by entries instead of crashing', () => {
    const error = blockedError() as {
      status: number
      data: { detail: { code: string; blocked_by: unknown[] } }
    }
    error.data.detail.blocked_by.push(
      null,
      'plain string',
      { id: 42, title: 'numeric id' },
      { id: SEED_IDS.P1_TASK_STRUCTURE },
    )

    const failure = readSubtaskBlockedFailure(error)

    expect(failure?.blockedBy).toHaveLength(1)
    expect(failure?.blockedBy[0].id).toBe(SEED_IDS.P1_TASK_FOUNDATION)
  })

  it('returns null for everything that is not the structured 400', () => {
    expect(readSubtaskBlockedFailure(null)).toBeNull()
    expect(readSubtaskBlockedFailure('boom')).toBeNull()
    expect(
      readSubtaskBlockedFailure({ ...blockedError(), status: 500 }),
    ).toBeNull()
    expect(readSubtaskBlockedFailure({ status: 400 })).toBeNull()
    expect(readSubtaskBlockedFailure({ status: 400, data: 'oops' })).toBeNull()
    expect(readSubtaskBlockedFailure({ status: 400, data: {} })).toBeNull()
    expect(
      readSubtaskBlockedFailure({ status: 400, data: { detail: 'plain' } }),
    ).toBeNull()
    expect(
      readSubtaskBlockedFailure({
        status: 400,
        data: { detail: { code: 'some_other_code' } },
      }),
    ).toBeNull()
  })
})
