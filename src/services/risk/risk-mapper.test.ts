/**
 * The seed carries no risk rows (a register is what a team fills in), so these
 * DTOs are built the way the MSW risk handler builds them: every id is a
 * `SEED_IDS` fact, and the test-only values are `FIXTURE_*` constants.
 */

import { FIXTURE_CREATED_AT, seedTask } from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'
import type { RiskResponseDTO } from '@/types/dto/risk-dto'

import { mapRiskDTO, mapRiskPageDTO, mapRiskSuggestionDTO } from './risk-mapper'

/** Test-only prose — the seed has no risk to quote. */
const FIXTURE_RISK_TITLE = 'Asentamiento diferencial en cimentacion'

function riskDTO(overrides: Partial<RiskResponseDTO> = {}): RiskResponseDTO {
  return {
    id: SEED_IDS.RISK_P1_STRUCTURAL,
    project_id: SEED_IDS.PROJECT_TORRE_ID,
    title: FIXTURE_RISK_TITLE,
    description: 'Suelo con capacidad portante menor a la estimada',
    category: 'structural',
    probability: 'high',
    impact: 'medium',
    // Derived server-side: weight(high)=3 × weight(medium)=2.
    score: 6,
    response_strategy: 'mitigate',
    mitigation: 'Estudio de suelos complementario',
    owner_id: SEED_IDS.USER_MIGUEL_ID,
    status: 'open',
    linked_task_id: SEED_IDS.P1_TASK_FOUNDATION,
    identified_at: FIXTURE_CREATED_AT,
    created_at: FIXTURE_CREATED_AT,
    updated_at: FIXTURE_CREATED_AT,
    ...overrides,
  }
}

describe('mapRiskDTO', () => {
  it('maps a full risk row field by field', () => {
    const dto = riskDTO()

    const risk = mapRiskDTO(dto)

    expect(risk.id).toBe(SEED_IDS.RISK_P1_STRUCTURAL)
    expect(risk.projectId).toBe(SEED_IDS.PROJECT_TORRE_ID)
    expect(risk.title).toBe(FIXTURE_RISK_TITLE)
    expect(risk.description).toBe(dto.description)
    expect(risk.category).toBe(dto.category)
    expect(risk.probability).toBe('high')
    expect(risk.impact).toBe('medium')
    expect(risk.score).toBe(6)
    expect(risk.responseStrategy).toBe('mitigate')
    expect(risk.mitigation).toBe(dto.mitigation)
    expect(risk.ownerId).toBe(SEED_IDS.USER_MIGUEL_ID)
    expect(risk.status).toBe('open')
    expect(risk.linkedTaskId).toBe(SEED_IDS.P1_TASK_FOUNDATION)
    expect(risk.identifiedAt).toBe(dto.identified_at)
    expect(risk.createdAt).toBe(dto.created_at)
    expect(risk.updatedAt).toBe(dto.updated_at)
  })

  it('keeps the optional fields null on a minimal row', () => {
    const risk = mapRiskDTO(
      riskDTO({
        description: null,
        category: null,
        response_strategy: null,
        mitigation: null,
        owner_id: null,
        linked_task_id: null,
      }),
    )

    expect(risk.description).toBeNull()
    expect(risk.category).toBeNull()
    expect(risk.responseStrategy).toBeNull()
    expect(risk.mitigation).toBeNull()
    expect(risk.ownerId).toBeNull()
    expect(risk.linkedTaskId).toBeNull()
  })
})

describe('mapRiskPageDTO', () => {
  it('unwraps the page envelope into a working list', () => {
    const risks = mapRiskPageDTO({
      items: [riskDTO()],
      total: 1,
      page: 1,
      page_size: 20,
      total_pages: 1,
    })

    expect(risks).toHaveLength(1)
    expect(risks[0].id).toBe(SEED_IDS.RISK_P1_STRUCTURAL)
  })

  it('degrades a missing items list to an empty register', () => {
    expect(
      mapRiskPageDTO({
        items: undefined as never,
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
      }),
    ).toEqual([])
  })
})

describe('mapRiskSuggestionDTO', () => {
  it('maps a delay-derived suggestion (D25)', () => {
    const dto = {
      task_id: SEED_IDS.P1_TASK_STRUCTURE,
      task_title: seedTask(SEED_IDS.P1_TASK_STRUCTURE).title,
      delay_days: 5,
      reason: 'Delayed critical task',
    }

    const suggestion = mapRiskSuggestionDTO(dto)

    expect(suggestion.taskId).toBe(SEED_IDS.P1_TASK_STRUCTURE)
    expect(suggestion.taskTitle).toBe('Estructura')
    expect(suggestion.delayDays).toBe(5)
    expect(suggestion.reason).toBe(dto.reason)
  })
})
