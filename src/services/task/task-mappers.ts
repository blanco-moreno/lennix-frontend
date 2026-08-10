import type { AssignedSubtask, Subtask, Task } from '@/types'
import type { PageDTO } from '@/types/dto/pagination-dto'
import type {
  AssignedSubtaskResponseDTO,
  SubtaskResponseDTO,
} from '@/types/dto/subtask-dto'
import type { TaskResponseDTO } from '@/types/dto/task-dto'
import { parseMoney } from '@/utils'

import { mapPage } from '../pagination'

export function mapSubtaskDTOToSubtask(dto: SubtaskResponseDTO): Subtask {
  return {
    id: dto.id,
    parentId: dto.parent_id,
    title: dto.title,
    description: dto.description,
    status: dto.status,
    priority: dto.priority,
    progress: dto.progress,
    startDate: dto.start_date,
    dueDate: dto.due_date,
    location: dto.location,
    assigneeId: dto.assignee_id,
    assigneeName: dto.assignee_name,
    spent: parseMoney(dto.spent) || 0,
    delayReason: dto.delay_reason,
    delayDays: dto.delay_days,
    isBlocked: dto.is_blocked,
    isCriticalPath: dto.is_critical_path,
    forceStarted: dto.force_started,
    atRisk: dto.at_risk,
    systemGenerated: dto.system_generated,
    createdAt: dto.created_at,
  }
}

export function mapTaskDTOToTask(dto: TaskResponseDTO): Task {
  return {
    id: dto.id,
    projectId: dto.project_id,
    projectName: dto.project_name,
    title: dto.title,
    description: dto.description,
    status: dto.status,
    priority: dto.priority,
    budget: dto.budget ? parseMoney(dto.budget) : null,
    progress: dto.progress,
    startDate: dto.start_date,
    dueDate: dto.due_date,
    spent: parseMoney(dto.spent) || 0,
    isOverBudget: dto.is_over_budget,
    delayReason: dto.delay_reason,
    delayDays: dto.delay_days,
    isDraft: dto.is_draft,
    isBlocked: dto.is_blocked,
    isCriticalPath: dto.is_critical_path,
    assigneeId: dto.assignee_id,
    assigneeName: dto.assignee_name,
    forceStarted: dto.force_started,
    atRisk: dto.at_risk,
    createdAt: dto.created_at,
    subtasks: dto.subtasks.map(mapSubtaskDTOToSubtask),
  }
}

export function mapSubtaskDTOArrayToSubtasks(
  dto: SubtaskResponseDTO[],
): Subtask[] {
  return dto.map(mapSubtaskDTOToSubtask)
}

export function mapTaskDTOArrayToTasks(dto: TaskResponseDTO[]): Task[] {
  return dto.map(mapTaskDTOToTask)
}

export function mapPageOfTasks(dto: PageDTO<TaskResponseDTO>) {
  return mapPage(dto, mapTaskDTOToTask)
}

/**
 * `GET /v1/tasks/assigned` — the subactivity mapper plus the context fields. It
 * reuses `mapSubtaskDTOToSubtask` rather than restating it, the same way the
 * response shares `ActivityResponse` on the server: the queue shows the entity
 * the rest of the product calls an activity, so it must not arrive in a second
 * shape. `parentId` is then restated, because here it is nullable — a row may
 * be a first-level activity, which has no phase above it.
 */
export function mapAssignedSubtaskDTO(
  dto: AssignedSubtaskResponseDTO,
): AssignedSubtask {
  // The shared mapper types `parentId` as required, so it is handed a
  // placeholder and the real, nullable value overwrites it on the next line.
  return {
    ...mapSubtaskDTOToSubtask({ ...dto, parent_id: '' }),
    parentId: dto.parent_id,
    projectId: dto.project_id,
    projectName: dto.project_name,
    parentTitle: dto.parent_title,
  }
}

export function mapPageOfAssignedSubtasks(
  dto: PageDTO<AssignedSubtaskResponseDTO>,
) {
  return mapPage(dto, mapAssignedSubtaskDTO)
}

/**
 * The structured refusal when a subactivity is still waiting: a code plus the
 * blocking predecessors by name, so the progress modal can say why.
 *
 * Returns `null` for anything else, so the caller falls through to its generic
 * error path — and `blockedBy` can legitimately be empty: a block whose edge is
 * broken (predecessor soft-deleted or dangling) has no predecessor left to
 * point at.
 */
export function readSubtaskBlockedFailure(
  error: unknown,
): { blockedBy: { id: string; title: string }[] } | null {
  if (!error || typeof error !== 'object') return null
  if ((error as { status?: unknown }).status !== 400) return null
  const data = (error as { data?: unknown }).data
  if (!data || typeof data !== 'object') return null
  const detail = (data as { detail?: unknown }).detail
  if (!detail || typeof detail !== 'object') return null
  if ((detail as { code?: unknown }).code !== 'subtask_blocked') return null
  const raw = (detail as { blocked_by?: unknown }).blocked_by
  const blockedBy = Array.isArray(raw)
    ? raw.flatMap((entry) => {
        if (!entry || typeof entry !== 'object') return []
        const { id, title } = entry as { id?: unknown; title?: unknown }
        return typeof id === 'string' && typeof title === 'string'
          ? [{ id, title }]
          : []
      })
    : []
  return { blockedBy }
}
