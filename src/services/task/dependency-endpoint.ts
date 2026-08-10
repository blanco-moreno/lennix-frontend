import type {
  TaskDependencyCreateRequestDTO,
  TaskDependencyUpdateRequestDTO,
} from '@/types/dto/dependency-dto'

export const createDependency = ({
  taskId,
  body,
}: {
  taskId: string
  body: TaskDependencyCreateRequestDTO
}) => ({
  url: `/v1/tasks/${taskId}/dependencies`,
  method: 'POST',
  body,
})

/** Re-shape an existing edge (type/lag) without deleting and recreating it. */
export const updateDependency = ({
  taskId,
  depId,
  body,
}: {
  taskId: string
  depId: number
  body: TaskDependencyUpdateRequestDTO
}) => ({
  url: `/v1/tasks/${taskId}/dependencies/${depId}`,
  method: 'PATCH',
  body,
})

export const removeDependency = ({
  taskId,
  depId,
}: {
  taskId: string
  depId: number
}) => ({
  url: `/v1/tasks/${taskId}/dependencies/${depId}`,
  method: 'DELETE',
})

export const getDependencyChains = (projectId: string) =>
  `/v1/tasks/projects/${projectId}/dependencies`
