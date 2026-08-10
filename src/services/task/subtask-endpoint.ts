import type {
  SubtaskCreateRequestDTO,
  SubtaskUpdateRequestDTO,
  SubtaskProgressUpdateRequestDTO,
  SubtaskStatusUpdateRequestDTO,
} from '@/types/dto/subtask-dto'

export const createSubtask = ({
  taskId,
  body,
}: {
  taskId: string
  body: SubtaskCreateRequestDTO
}) => ({
  url: `/v1/tasks/${taskId}/subtasks`,
  method: 'POST',
  body,
})

export const listSubtasks = (taskId: string) => `/v1/tasks/${taskId}/subtasks`

export const getSubtask = (id: string) => `/v1/tasks/subtasks/${id}`

export const updateSubtask = ({
  id,
  body,
}: {
  id: string
  body: SubtaskUpdateRequestDTO
}) => ({
  url: `/v1/tasks/subtasks/${id}`,
  method: 'PUT',
  body,
})

export const deleteSubtask = (id: string) => ({
  url: `/v1/tasks/subtasks/${id}`,
  method: 'DELETE',
})

export const updateSubtaskProgress = ({
  id,
  body,
}: {
  id: string
  body: SubtaskProgressUpdateRequestDTO
}) => ({
  url: `/v1/tasks/subtasks/${id}/progress`,
  method: 'PATCH',
  body,
})

export const updateSubtaskStatus = ({
  id,
  body,
}: {
  id: string
  body: SubtaskStatusUpdateRequestDTO
}) => ({
  url: `/v1/tasks/subtasks/${id}/status`,
  method: 'PATCH',
  body,
})

/** The subactivity door of the direct force-start — see `task-endpoint.ts`. */
export const forceStartSubtask = ({ id }: { id: string }) => ({
  url: `/v1/tasks/subtasks/${id}/force-start`,
  method: 'POST',
  body: {},
})
