import { http, HttpResponse } from 'msw'

import type {
  RiskCreateRequestDTO,
  RiskResponseDTO,
  RiskUpdateRequestDTO,
} from '@/types/dto/risk-dto'

/**
 * The project risk register.
 *
 * The `lennix_pro` seed carries no risks — a register is what a team fills in,
 * not something a demo ships pre-populated — so these handlers start empty and
 * keep whatever the client writes, in memory, for the session. Nothing is
 * invented: every row here came from the form the user just submitted.
 */
const risks = new Map<string, RiskResponseDTO>()

/** Mirrors `RISK_LEVEL_WEIGHT` in `app/risks/constants.py`. */
const WEIGHT: Record<string, number> = { low: 1, medium: 2, high: 3 }

let nextId = 1

function buildRisk(
  body: RiskCreateRequestDTO,
  id: string,
  createdAt: string,
): RiskResponseDTO {
  return {
    id,
    project_id: body.project_id,
    title: body.title,
    description: body.description ?? null,
    category: body.category ?? null,
    probability: body.probability,
    impact: body.impact,
    score: WEIGHT[body.probability] * WEIGHT[body.impact],
    response_strategy: body.response_strategy ?? null,
    mitigation: body.mitigation ?? null,
    owner_id: null,
    status: body.status ?? 'open',
    linked_task_id: body.linked_task_id ?? null,
    identified_at: createdAt,
    created_at: createdAt,
    updated_at: createdAt,
  }
}

export const listRisksHandler = http.get('*/v1/risks', ({ request }) => {
  const params = new URL(request.url).searchParams
  const projectId = params.get('project_id')
  const state = params.get('status')
  const items = [...risks.values()].filter(
    (risk) =>
      risk.project_id === projectId && (!state || risk.status === state),
  )
  return HttpResponse.json({
    items,
    total: items.length,
    page: 1,
    page_size: 20,
    total_pages: 1,
  })
})

/** Suggestions are derived, never persisted — the empty case is honest. */
export const listRiskSuggestionsHandler = http.get(
  '*/v1/risks/suggestions',
  () => HttpResponse.json([]),
)

export const createRiskHandler = http.post(
  '*/v1/risks',
  async ({ request }) => {
    const body = (await request.json()) as RiskCreateRequestDTO
    const id = `r0000000-0000-0000-0000-${String(nextId++).padStart(12, '0')}`
    const createdAt = new Date().toISOString()
    const risk = buildRisk(body, id, createdAt)
    risks.set(id, risk)
    return HttpResponse.json(risk, { status: 201 })
  },
)

export const updateRiskHandler = http.put(
  '*/v1/risks/:riskId',
  async ({ params, request }) => {
    const id = String(params.riskId)
    const existing = risks.get(id)
    if (!existing) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as RiskUpdateRequestDTO
    const probability = body.probability ?? existing.probability
    const impact = body.impact ?? existing.impact
    const updated: RiskResponseDTO = {
      ...existing,
      ...body,
      probability,
      impact,
      score: WEIGHT[probability] * WEIGHT[impact],
      updated_at: new Date().toISOString(),
    }
    risks.set(id, updated)
    return HttpResponse.json(updated)
  },
)

export const deleteRiskHandler = http.delete(
  '*/v1/risks/:riskId',
  ({ params }) => {
    risks.delete(String(params.riskId))
    return new HttpResponse(null, { status: 204 })
  },
)

export const riskHandlers = [
  // `/suggestions` before `/:riskId` so the literal path wins.
  listRiskSuggestionsHandler,
  listRisksHandler,
  createRiskHandler,
  updateRiskHandler,
  deleteRiskHandler,
]
