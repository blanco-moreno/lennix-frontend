import type {
  Risk,
  RiskListFilters,
  RiskSuggestion,
  RiskWriteInput,
} from '@/types'
import type {
  RiskCreateRequestDTO,
  RiskResponseDTO,
  RiskSuggestionResponseDTO,
  RiskUpdateRequestDTO,
} from '@/types/dto/risk-dto'

import { api } from '../api-injector'

import {
  createRisk,
  listRiskSuggestions,
  listRisks,
  riskById,
} from './risk-endpoint'
import { mapRiskDTO, mapRiskPageDTO, mapRiskSuggestionDTO } from './risk-mapper'

/**
 * A risk write only ever moves this project's register — never the schedule,
 * never another project's cache. The register is first-class but it is
 * also self-contained: nothing else in the app reads from it.
 */
const riskTagsFor = (projectId: string) =>
  [
    { type: 'Risk' as const, id: projectId },
    { type: 'Risk' as const, id: 'LIST' },
    // Every risk write (create/update/close) lands a Historial row.
    { type: 'ProjectActivity' as const, id: projectId },
  ] as const

function toWriteBody(input: RiskWriteInput) {
  return {
    title: input.title,
    description: input.description,
    category: input.category,
    probability: input.probability,
    impact: input.impact,
    response_strategy: input.responseStrategy,
    mitigation: input.mitigation,
    status: input.status,
  }
}

export const riskApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listRisks: builder.query<Risk[], RiskListFilters>({
      query: listRisks,
      transformResponse: mapRiskPageDTO,
      providesTags: (_result, _error, { projectId }) => [
        { type: 'Risk', id: projectId },
        { type: 'Risk', id: 'LIST' },
      ],
    }),

    listRiskSuggestions: builder.query<RiskSuggestion[], string>({
      query: listRiskSuggestions,
      transformResponse: (dto: RiskSuggestionResponseDTO[]) =>
        dto.map(mapRiskSuggestionDTO),
      providesTags: (_result, _error, projectId) => [
        { type: 'Risk', id: `suggestions-${projectId}` },
      ],
    }),

    createRisk: builder.mutation<
      Risk,
      { projectId: string; input: RiskWriteInput }
    >({
      query: ({ projectId, input }) => {
        const body: RiskCreateRequestDTO = {
          project_id: projectId,
          ...toWriteBody(input),
        }
        return { url: createRisk, method: 'POST', body }
      },
      transformResponse: (dto: RiskResponseDTO) => mapRiskDTO(dto),
      invalidatesTags: (_result, _error, { projectId }) => [
        ...riskTagsFor(projectId),
        // A suggestion that became a risk should stop being suggested.
        { type: 'Risk', id: `suggestions-${projectId}` },
      ],
    }),

    updateRisk: builder.mutation<
      Risk,
      { projectId: string; riskId: string; input: RiskWriteInput }
    >({
      query: ({ riskId, input }) => {
        const body: RiskUpdateRequestDTO = toWriteBody(input)
        return { url: riskById(riskId), method: 'PUT', body }
      },
      transformResponse: (dto: RiskResponseDTO) => mapRiskDTO(dto),
      invalidatesTags: (_result, _error, { projectId }) =>
        riskTagsFor(projectId),
    }),

    deleteRisk: builder.mutation<void, { projectId: string; riskId: string }>({
      query: ({ riskId }) => ({ url: riskById(riskId), method: 'DELETE' }),
      invalidatesTags: (_result, _error, { projectId }) =>
        riskTagsFor(projectId),
    }),
  }),
})

export const {
  useListRisksQuery,
  useListRiskSuggestionsQuery,
  useCreateRiskMutation,
  useUpdateRiskMutation,
  useDeleteRiskMutation,
} = riskApi
