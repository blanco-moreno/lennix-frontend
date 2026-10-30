import type { TrashedExpense, TrashedProject, TrashedTask } from '@/types'
import type {
  TrashedExpenseResponseDTO,
  TrashedProjectResponseDTO,
  TrashedTaskResponseDTO,
} from '@/types/dto/trash-dto'
import { toProjectCurrency } from '@/utils'

export function mapTrashedProjectDTOToDomain(
  dto: TrashedProjectResponseDTO,
): TrashedProject {
  return {
    id: dto.id,
    name: dto.name,
    organizationId: dto.organization_id,
    deletedAt: dto.deleted_at,
    deletedBy: dto.deleted_by,
  }
}

export function mapTrashedTaskDTOToDomain(
  dto: TrashedTaskResponseDTO,
): TrashedTask {
  return {
    id: dto.id,
    title: dto.title,
    projectId: dto.project_id,
    parentId: dto.parent_id,
    deletedAt: dto.deleted_at,
    deletedBy: dto.deleted_by,
  }
}

export function mapTrashedExpenseDTOToDomain(
  dto: TrashedExpenseResponseDTO,
): TrashedExpense {
  return {
    id: dto.id,
    description: dto.description,
    amount: dto.amount,
    currency: toProjectCurrency(dto.currency),
    subtaskId: dto.subtask_id ?? null,
    projectId: dto.project_id ?? null,
    deletedAt: dto.deleted_at,
    deletedBy: dto.deleted_by,
  }
}
