import type {
  RiskLevelDTO,
  RiskResponseStrategyDTO,
  RiskStatusDTO,
} from './dto/risk-dto'

export type RiskLevel = RiskLevelDTO
export type RiskResponseStrategy = RiskResponseStrategyDTO
export type RiskStatus = RiskStatusDTO

/** Matrix axis order, low → high. Drives both the grid layout and the score. */
export const RISK_LEVELS: readonly RiskLevel[] = ['low', 'medium', 'high']

/** Ordinal weights, mirrored from `RISK_LEVEL_WEIGHT` in `app/risks/constants.py`. */
export const RISK_LEVEL_WEIGHT: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

/** The same 1..9 score the backend derives; recomputed here for the form preview. */
export function riskScore(probability: RiskLevel, impact: RiskLevel): number {
  return RISK_LEVEL_WEIGHT[probability] * RISK_LEVEL_WEIGHT[impact]
}

/**
 * Severity band of a 3×3 cell. Three bands over nine cells: 1–2 low, 3–4
 * medium, 6–9 high (5, 7 and 8 are unreachable products on a 3×3 grid).
 */
export type RiskSeverity = 'low' | 'medium' | 'high'

export function riskSeverity(score: number): RiskSeverity {
  if (score >= 6) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

export interface Risk {
  id: string
  projectId: string
  title: string
  description: string | null
  category: string | null
  probability: RiskLevel
  impact: RiskLevel
  score: number
  responseStrategy: RiskResponseStrategy | null
  mitigation: string | null
  ownerId: string | null
  status: RiskStatus
  linkedTaskId: string | null
  identifiedAt: string
  createdAt: string
  updatedAt: string
}

export interface RiskSuggestion {
  taskId: string
  taskTitle: string
  delayDays: number
  reason: string
}

export interface RiskListFilters {
  projectId: string
  status?: RiskStatus
}

export interface RiskWriteInput {
  title: string
  description: string | null
  category: string | null
  probability: RiskLevel
  impact: RiskLevel
  responseStrategy: RiskResponseStrategy | null
  mitigation: string | null
  status: RiskStatus
}
