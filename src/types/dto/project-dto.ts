/**
 * Project API DTOs — matches the backend contract for /v1/projects endpoints.
 */

/**
 * The wire spells these as strings, but the vocabulary is the closed
 * `ProjectStatus` / `ProjectPriority` enums in
 * `lennix-ms-bk/app/projects/constants.py`: every write is enum-validated,
 * so no other value can reach a response.
 */
export type ProjectStatusDTO =
  | 'on_track'
  | 'delayed'
  | 'ahead'
  | 'completed'
  | 'archived'
export type ProjectPriorityDTO = 'low' | 'medium' | 'high'

export interface ProjectMemberResponseDTO {
  id: number
  user_id: string
  member_name: string | null
  member_email: string | null
  /** Whether this row is the project's manager — `Project.manager_id`. */
  is_manager: boolean
  joined_at: string
}

/**
 * Somebody the obra would accept as its jefe de obra —
 * `GET /v1/projects/:id/assignable-members`, a `Page` envelope.
 *
 * The **wide** set: every member of the organization plus its owner, because
 * naming a jefe de obra who is not on the team yet is legitimate and the write
 * seats them. `is_work_assignable` narrows it to the rows the *other* write
 * takes — an activity or subactivity assignee — and offering a row without it
 * earns a 400.
 *
 * `is_project_member` is false for whoever is offered without a team row, and
 * `role_slug` is what the picker badges them with.
 */
export interface AssignableMemberResponseDTO {
  user_id: string
  member_name: string
  member_email: string
  role_slug: string
  is_project_member: boolean
  is_work_assignable: boolean
}

/**
 * The obra's verdict, computed once by the backend.
 *
 * Mirrors `ProjectHealth` in `lennix-ms-bk/app/projects/health.py`. The
 * vocabulary is closed and ordered by precedence: the server already decided
 * which fact wins, so a client never combines two fields to reach an opinion.
 *
 * It carries **severity, never colour** — the palette is ours to change without
 * a contract change — and `level` alone is enough to paint.
 */
export type ProjectHealthLevelDTO =
  | 'draft'
  | 'completed'
  | 'archived'
  | 'critical'
  | 'delayed'
  | 'overdue'
  | 'over_budget'
  | 'ahead'
  | 'on_track'

export interface ProjectHealthDTO {
  level: ProjectHealthLevelDTO
  /** The engine's worst slip on the project. */
  delay_days: number
  /** Days past `due_date`; 0 when the date says nothing about this project. */
  days_overdue: number
}

/** Project endpoints — response */
export interface ProjectResponseDTO {
  id: string
  organization_id: string
  name: string
  description: string | null
  location: string | null
  status: ProjectStatusDTO
  priority: ProjectPriorityDTO
  budget: string | null
  /** ISO 4217; absent from a backend older than `BUD-10`. */
  currency?: string
  manager_id: string | null
  manager_name: string | null
  is_draft: boolean
  progress: number
  start_date: string | null
  due_date: string | null
  allocated: string
  spent: string
  is_over_budget: boolean
  created_at: string
  health: ProjectHealthDTO
  /** Where the import wizard was left. Advisory, and null on a live obra. */
  review_step: string | null
}

/** GET /v1/projects/:id — response (extends ProjectResponseDTO) */
export interface ProjectDetailResponseDTO extends ProjectResponseDTO {
  members: ProjectMemberResponseDTO[]
}

/**
 * `GET /v1/projects/:id/activity` — one row of the project Historial.
 *
 * Mirrors `ProjectActivityResponse` in `lennix-ms-bk/app/projects/schemas.py`.
 * `action` and `entity_type` are stable keys from the closed enums in
 * `app/projects/constants.py`, never prose: the frontend composes the sentence.
 * The endpoint returns a `Page` envelope, newest first.
 */
export interface ProjectActivityResponseDTO {
  id: string
  occurred_at: string
  actor_id: string | null
  actor_name: string | null
  action: string
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  old_value: string | null
  new_value: string | null
}

/** GET /v1/projects/:id/budget — response */
export interface ProjectBudgetResponseDTO {
  project_id: string
  budget: string | null
  allocated: string
  unallocated: string
  spent: string
  remaining: string
  is_over_budget: boolean
  utilization_percentage: number
}

/**
 * PUT /v1/projects/:id — request.
 *
 * Exactly what `ProjectUpdateRequest` accepts (`app/projects/schemas.py`): no
 * dates — a project derives both from its schedule.
 */
export interface ProjectUpdateRequestDTO {
  name?: string | null
  description?: string | null
  location?: string | null
  budget?: string | null
  /** ISO 4217 (`BUD-10`); a relabel, never a conversion. */
  currency?: string | null
  manager_id?: string | null
}

/** PATCH /v1/projects/:id/status — request */
export interface ProjectStatusUpdateRequestDTO {
  status: ProjectStatusDTO
}

/** PATCH /v1/projects/:id/priority — request */
export interface ProjectPriorityUpdateRequestDTO {
  priority: ProjectPriorityDTO
}

/** PATCH /v1/projects/:id/budget — request */
export interface ProjectBudgetUpdateRequestDTO {
  budget: string
}

/**
 * POST /v1/projects/:id/team — request.
 *
 * Membership only — no `role` field in the contract. Leadership is
 * `Project.manager_id`, set through PUT.
 */
export interface ProjectTeamMemberAddRequestDTO {
  user_id: string
}
