/** `/v1/projects` responses for the seeded demo portfolio. */

import {
  SEED_IDS,
  SEED_ORGANIZATION,
  SEED_PROJECTS,
  type SeedProject,
} from '@/tests/seed'
import type {
  AssignableMemberResponseDTO,
  IndirectBudgetResponseDTO,
  ProjectBudgetResponseDTO,
  ProjectHealthDTO,
  ProjectDetailResponseDTO,
  ProjectMemberResponseDTO,
  ProjectResponseDTO,
} from '@/types/dto/project-dto'
// Deep import, not the `@/utils` barrel: this module is on MSW's setup
// path, so every test file would otherwise import the whole utils graph
// (~600ms per file, ~85% of the suite's per-file setup cost).
import { roleIdToSlug } from '@/utils/permissions/roles'

import {
  FIXTURE_CREATED_AT,
  decimal,
  requiredDecimal,
  seedDraftProjects,
  seedLiveProjects,
  seedProject,
  seedUser,
  seedUserName,
} from './seed-lookup'

/** Statuses a passed due date no longer says anything about. */
const SETTLED_STATUSES = ['completed', 'archived']

/**
 * Mirrors `derive_project_health` in ms-bk, precedence and all.
 *
 * Same arithmetic, same order, deliberately: the fixtures exist to be the wire
 * as the backend actually sends it, so a rule that drifts here is a rule the
 * tests would keep passing on after the real one changed.
 *
 * `today` is a parameter for the same reason the attention list takes one: the
 * seed's due dates are absolute, so a test that pins *which* level an obra
 * reads has to pin the clock too.
 */
export function seedProjectHealthDTO(
  project: {
    status: string
    isDraft: boolean
    dueDate: string | null
    isOverBudget: boolean
  },
  today: Date = new Date(),
): ProjectHealthDTO {
  const judgeable =
    !project.isDraft && !SETTLED_STATUSES.includes(project.status)
  const daysOverdue =
    judgeable && project.dueDate !== null
      ? Math.max(
          0,
          Math.floor(
            (today.getTime() - new Date(project.dueDate).getTime()) /
              86_400_000,
          ),
        )
      : 0
  const isDelayed = project.status === 'delayed'

  const level: ProjectHealthDTO['level'] = project.isDraft
    ? 'draft'
    : project.status === 'completed'
      ? 'completed'
      : project.status === 'archived'
        ? 'archived'
        : isDelayed && daysOverdue > 0
          ? 'critical'
          : isDelayed
            ? 'delayed'
            : daysOverdue > 0
              ? 'overdue'
              : project.isOverBudget
                ? 'over_budget'
                : project.status === 'ahead'
                  ? 'ahead'
                  : 'on_track'

  return { level, delay_days: 0, days_overdue: daysOverdue }
}

export function seedProjectDTO(
  projectId: string,
  overrides?: Partial<ProjectResponseDTO>,
): ProjectResponseDTO {
  const dto = { ...toProjectDTO(seedProject(projectId)), ...overrides }
  // The verdict is DERIVED, so an override of one of its inputs has to move it
  // — otherwise a test that flips `is_draft` gets a row the backend could never
  // send, and asserts against a shape that does not exist.
  return overrides?.health
    ? dto
    : {
        ...dto,
        health: seedProjectHealthDTO({
          status: dto.status,
          isDraft: dto.is_draft,
          dueDate: dto.due_date,
          isOverBudget: dto.is_over_budget,
        }),
      }
}

function toProjectDTO(project: SeedProject): ProjectResponseDTO {
  return {
    id: project.id,
    organization_id: project.organizationId,
    name: project.name,
    description: project.description,
    location: project.location,
    // The generated seed mirror types these as `string`; the values come from
    // the enum-validated backend seed, so the narrowing is safe.
    status: project.status as ProjectResponseDTO['status'],
    priority: project.priority as ProjectResponseDTO['priority'],
    budget: decimal(project.budget),
    manager_id: project.managerId,
    manager_name: seedUserName(project.managerId),
    is_draft: project.isDraft,
    progress: project.progress,
    start_date: project.startDate,
    due_date: project.dueDate,
    allocated: requiredDecimal(project.allocated),
    spent: requiredDecimal(project.spent),
    is_over_budget: project.isOverBudget,
    created_at: FIXTURE_CREATED_AT,
    health: seedProjectHealthDTO(project),
    // The seed leaves its draft on the budget step; a live obra never has one.
    review_step: project.isDraft ? 'budget' : null,
  }
}

/** `GET /v1/projects` — live projects only; drafts have their own home. */
export function seedProjectListDTO(): ProjectResponseDTO[] {
  return seedLiveProjects().map(toProjectDTO)
}

/** `GET /v1/projects?is_draft=true` — the pending import draft. */
export function seedDraftProjectListDTO(): ProjectResponseDTO[] {
  return seedDraftProjects().map(toProjectDTO)
}

export function seedProjectTeamDTO(
  projectId: string,
): ProjectMemberResponseDTO[] {
  const project = seedProject(projectId)
  return project.members.map((member, index) => {
    const user = seedUser(member.userId)
    return {
      id: index + 1,
      user_id: user.userId,
      member_name: `${user.firstName} ${user.lastName}`,
      member_email: user.email,
      // Derived exactly as ms-bk derives it: one manager per project, and it
      // is `Project.manager_id`.
      is_manager: project.managerId === member.userId,
      joined_at: FIXTURE_CREATED_AT,
    }
  })
}

/**
 * `GET /v1/projects/:id/assignable-members` — derived exactly as ms-bk derives
 * it: the **wide** set (every member of the organization, plus its owner, whom
 * `manager_id` accepts because that write seats them), the team first, each row
 * flagged with the narrower gate an activity assignee goes through.
 */
export function seedAssignableMembersDTO(
  projectId: string,
): AssignableMemberResponseDTO[] {
  const project = seedProject(projectId)
  const onTeam = (userId: string) =>
    project.members.some((row) => row.userId === userId)
  const rows = SEED_ORGANIZATION.members.map((member) => {
    const user = seedUser(member.userId)
    const isProjectMember = onTeam(member.userId)
    return {
      user_id: user.userId,
      member_name: `${user.firstName} ${user.lastName}`,
      member_email: user.email,
      role_slug: roleIdToSlug(user.roleId) ?? 'user',
      is_project_member: isProjectMember,
      // The obra's own gate: a team row, the organization's owner, or an
      // organization-wide role holding a membership row.
      is_work_assignable:
        isProjectMember ||
        member.userId === SEED_ORGANIZATION.ownerId ||
        ORGANIZATION_WIDE_ROLE_IDS.includes(user.roleId),
    }
  })
  // The team first, then by name — the server's own ordering.
  return [
    ...rows.filter((row) => row.is_project_member),
    ...rows.filter((row) => !row.is_project_member),
  ]
}

/** `owner` (1) and `admin` (2) — the two roles that act organization-wide. */
const ORGANIZATION_WIDE_ROLE_IDS = [1, 2]

export function seedProjectDetailDTO(
  projectId: string,
  overrides?: Partial<ProjectDetailResponseDTO>,
): ProjectDetailResponseDTO {
  return {
    ...seedProjectDTO(projectId),
    members: seedProjectTeamDTO(projectId),
    ...overrides,
  }
}

/** `GET /v1/projects/:id/budget` — the same arithmetic the backend applies. */
export function seedProjectBudgetDTO(
  projectId: string,
): ProjectBudgetResponseDTO {
  const project = seedProject(projectId)
  const budget = Number(project.budget ?? 0)
  const allocated = Number(project.allocated)
  const spent = Number(project.spent)
  return {
    project_id: project.id,
    budget: decimal(project.budget),
    allocated: allocated.toFixed(2),
    unallocated: (budget - allocated).toFixed(2),
    spent: spent.toFixed(2),
    remaining: (budget - spent).toFixed(2),
    is_over_budget: project.isOverBudget,
    utilization_percentage:
      budget > 0 ? Number(((spent / budget) * 100).toFixed(2)) : 0,
  }
}

/**
 * A seeded project's overheads (ms-bk `BUD-11`). The seed carries none, so
 * every project reads as it did before overheads existed; a test that needs
 * lines passes them.
 */
export function seedIndirectBudgetDTO(
  projectId: string,
  lines: IndirectBudgetResponseDTO['lines'] = [],
): IndirectBudgetResponseDTO {
  const project = seedProject(projectId)
  const budget = Number(project.budget ?? 0)
  const allocated = Number(project.allocated)
  const indirect = lines.reduce((sum, line) => sum + Number(line.amount), 0)
  return {
    project_id: project.id,
    lines,
    indirect_allocated: indirect.toFixed(2),
    unallocated: budget ? (budget - allocated - indirect).toFixed(2) : '0.00',
  }
}

/** Torre Residencial Norte — the richest project, used as the default. */
export const DEFAULT_SEED_PROJECT_ID = SEED_IDS.PROJECT_TORRE_ID

/**
 * Maps a route param to a seeded project id, falling back to the default when
 * a test navigates to an id the seed doesn't contain. Keeps MSW handlers from
 * 404-ing on ids that were never meant to be the subject of the assertion.
 */
export function resolveSeedProjectId(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_SEED_PROJECT_ID
  return SEED_PROJECTS.some((project) => project.id === value)
    ? value
    : DEFAULT_SEED_PROJECT_ID
}
