import type {
  AssignableMember,
  IndirectBudget,
  IndirectBudgetLine,
  Page,
  Project,
  ProjectActivity,
  ProjectActivityAction,
  ProjectActivityEntity,
  ProjectBudget,
  ProjectDetail,
  ProjectHealth,
  ProjectMember,
  ReviewStep,
} from '@/types'
import { REVIEW_STEPS } from '@/types'
import type { PageDTO } from '@/types/dto/pagination-dto'
import type {
  AssignableMemberResponseDTO,
  IndirectBudgetResponseDTO,
  ProjectActivityResponseDTO,
  ProjectBudgetResponseDTO,
  ProjectHealthDTO,
  ProjectResponseDTO,
  ProjectDetailResponseDTO,
  ProjectMemberResponseDTO,
} from '@/types/dto/project-dto'
import {
  parseMoney,
  ROLE_SLUGS,
  type RoleSlug,
  toIndirectCategory,
  toProjectCurrency,
} from '@/utils'

import { mapPage } from '../pagination'

export function mapProjectMemberResponseDTOToProjectMember(
  dto: ProjectMemberResponseDTO,
): ProjectMember {
  return {
    id: dto.id,
    userId: dto.user_id,
    memberName: dto.member_name,
    memberEmail: dto.member_email,
    isManager: dto.is_manager,
    joinedAt: dto.joined_at,
  }
}

export function mapAssignableMemberResponseDTOToAssignableMember(
  dto: AssignableMemberResponseDTO,
): AssignableMember {
  return {
    userId: dto.user_id,
    memberName: dto.member_name,
    memberEmail: dto.member_email,
    // The wire types the slug as an open string; a value this build has no
    // label for badges nothing rather than printing a raw key.
    roleSlug: ROLE_SLUGS.includes(dto.role_slug as RoleSlug)
      ? (dto.role_slug as RoleSlug)
      : null,
    isProjectMember: dto.is_project_member,
    isWorkAssignable: dto.is_work_assignable,
  }
}

export function mapProjectBudgetResponseDTOToProjectBudget(
  dto: ProjectBudgetResponseDTO,
): ProjectBudget {
  return {
    projectId: dto.project_id,
    budget: dto.budget ? parseMoney(dto.budget) : null,
    allocated: parseMoney(dto.allocated) || 0,
    indirectAllocated: parseMoney(dto.indirect_allocated) || 0,
    unallocated: parseMoney(dto.unallocated) || 0,
    spent: parseMoney(dto.spent) || 0,
    remaining: parseMoney(dto.remaining) || 0,
    isOverBudget: dto.is_over_budget,
    utilizationPercentage: dto.utilization_percentage,
  }
}

/** The verdict, renamed and otherwise untouched — judging it is the server's job. */
export function mapProjectHealthDTOToProjectHealth(
  dto: ProjectHealthDTO,
): ProjectHealth {
  return {
    level: dto.level,
    delayDays: dto.delay_days,
    daysOverdue: dto.days_overdue,
  }
}

export function mapProjectDTOToProject(dto: ProjectResponseDTO): Project {
  return {
    id: dto.id,
    organizationId: dto.organization_id,
    name: dto.name,
    description: dto.description,
    location: dto.location,
    status: dto.status,
    priority: dto.priority,
    budget: dto.budget ? parseMoney(dto.budget) : null,
    currency: toProjectCurrency(dto.currency),
    managerId: dto.manager_id,
    managerName: dto.manager_name,
    isDraft: dto.is_draft,
    progress: dto.progress,
    startDate: dto.start_date,
    dueDate: dto.due_date,
    allocated: parseMoney(dto.allocated) || 0,
    indirectAllocated: parseMoney(dto.indirect_allocated) || 0,
    spent: parseMoney(dto.spent) || 0,
    isOverBudget: dto.is_over_budget,
    createdAt: dto.created_at,
    health: mapProjectHealthDTOToProjectHealth(dto.health),
    reviewStep: REVIEW_STEPS.includes(dto.review_step as ReviewStep)
      ? (dto.review_step as ReviewStep)
      : null,
  }
}

export function mapProjectDetailDTOToProjectDetail(
  dto: ProjectDetailResponseDTO,
): ProjectDetail {
  return {
    ...mapProjectDTOToProject(dto),
    members: dto.members.map(mapProjectMemberResponseDTOToProjectMember),
  }
}

export function mapProjectDTOArrayToProjects(
  dto: ProjectResponseDTO[] | { items: ProjectResponseDTO[] },
): Project[] {
  const items = Array.isArray(dto) ? dto : dto.items
  return items.map(mapProjectDTOToProject)
}

export function mapPageOfProjects(dto: PageDTO<ProjectResponseDTO>) {
  return mapPage(dto, mapProjectDTOToProject)
}

export function mapProjectMemberArrayToProjectMembers(
  dto: ProjectMemberResponseDTO[],
): ProjectMember[] {
  return dto.map(mapProjectMemberResponseDTOToProjectMember)
}

export function mapProjectActivityDTOToProjectActivity(
  dto: ProjectActivityResponseDTO,
): ProjectActivity {
  return {
    id: dto.id,
    occurredAt: dto.occurred_at,
    actorId: dto.actor_id,
    actorName: dto.actor_name,
    // The wire types these as open strings; the closed enums live in
    // `app/projects/constants.py`. An action the frontend has no sentence for
    // renders a translated fallback, never the raw key.
    action: dto.action as ProjectActivityAction,
    entityType: dto.entity_type as ProjectActivityEntity,
    entityId: dto.entity_id,
    entityName: dto.entity_name,
    oldValue: dto.old_value,
    newValue: dto.new_value,
  }
}

export function mapPageOfProjectActivity(
  dto: PageDTO<ProjectActivityResponseDTO>,
): Page<ProjectActivity> {
  return mapPage(dto, mapProjectActivityDTOToProjectActivity)
}

export function mapIndirectBudgetDTO(
  dto: IndirectBudgetResponseDTO,
): IndirectBudget {
  const lines: IndirectBudgetLine[] = []
  for (const line of dto.lines) {
    const category = toIndirectCategory(line.category)
    if (category === null) continue
    lines.push({
      category,
      amount: parseMoney(line.amount),
      spent: parseMoney(line.spent),
      isOverBudget: line.is_over_budget,
    })
  }
  return {
    projectId: dto.project_id,
    lines,
    indirectAllocated: parseMoney(dto.indirect_allocated),
    unallocated: parseMoney(dto.unallocated),
  }
}
