import type { Risk, RiskSuggestion } from '@/types'
import type { PageDTO } from '@/types/dto/pagination-dto'
import type {
  RiskResponseDTO,
  RiskSuggestionResponseDTO,
} from '@/types/dto/risk-dto'

export function mapRiskDTO(dto: RiskResponseDTO): Risk {
  return {
    id: dto.id,
    projectId: dto.project_id,
    title: dto.title,
    description: dto.description,
    category: dto.category,
    probability: dto.probability,
    impact: dto.impact,
    score: dto.score,
    responseStrategy: dto.response_strategy,
    mitigation: dto.mitigation,
    ownerId: dto.owner_id,
    status: dto.status,
    linkedTaskId: dto.linked_task_id,
    identifiedAt: dto.identified_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}

/**
 * The register renders one working list, so the page envelope is unwrapped
 * here: the component never has to know the endpoint is paginated.
 */
export function mapRiskPageDTO(dto: PageDTO<RiskResponseDTO>): Risk[] {
  return (dto.items ?? []).map(mapRiskDTO)
}

export function mapRiskSuggestionDTO(
  dto: RiskSuggestionResponseDTO,
): RiskSuggestion {
  return {
    taskId: dto.task_id,
    taskTitle: dto.task_title,
    delayDays: dto.delay_days,
    code: dto.code,
  }
}
