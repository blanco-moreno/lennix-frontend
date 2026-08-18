/**
 * DTOs mirroring `app/risks/schemas.py` on the backend.
 * snake_case here; the domain types in `@/types/risk` are camelCase.
 */

/** The two 3×3 axes. */
export type RiskLevelDTO = 'low' | 'medium' | 'high'

/** PMI / ISO 31000 treatment strategies. */
export type RiskResponseStrategyDTO =
  | 'avoid'
  | 'mitigate'
  | 'transfer'
  | 'accept'

export type RiskStatusDTO = 'open' | 'mitigating' | 'closed'

export interface RiskResponseDTO {
  id: string
  project_id: string
  title: string
  description: string | null
  category: string | null
  probability: RiskLevelDTO
  impact: RiskLevelDTO
  /** Derived server-side: probability weight × impact weight, 1..9. */
  score: number
  response_strategy: RiskResponseStrategyDTO | null
  mitigation: string | null
  owner_id: string | null
  status: RiskStatusDTO
  linked_task_id: string | null
  identified_at: string
  created_at: string
  updated_at: string
}

export interface RiskCreateRequestDTO {
  project_id: string
  title: string
  description?: string | null
  category?: string | null
  probability: RiskLevelDTO
  impact: RiskLevelDTO
  response_strategy?: RiskResponseStrategyDTO | null
  mitigation?: string | null
  status?: RiskStatusDTO
  linked_task_id?: string | null
}

/** Partial update — only the supplied fields change (backend contract). */
export type RiskUpdateRequestDTO = Partial<
  Omit<RiskCreateRequestDTO, 'project_id'>
>

/**
 * A *suggestion* to open a risk from a delayed critical task. Never
 * persisted: the human decides whether it becomes a risk.
 */
/** Why the backend suggests a risk — closed (`RiskSuggestionCode`, RSK-3). */
export type RiskSuggestionCodeDTO = 'critical_path_delay'

export interface RiskSuggestionResponseDTO {
  task_id: string
  task_title: string
  delay_days: number
  code: RiskSuggestionCodeDTO
}
