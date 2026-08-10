/** GET /v1/plans — response item */
export interface PlanResponseDTO {
  id: number
  name: string
  max_team_size: number | null
  max_projects: number | null
  storage_mb: number
  ai_requests: number
  created_at: string
}
