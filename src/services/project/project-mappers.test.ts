import {
  DEFAULT_SEED_PROJECT_ID,
  seedProject,
  seedProjectActivityListDTO,
  seedProjectActivityPageDTO,
  seedProjectBudgetDTO,
  seedProjectDTO,
  seedProjectDetailDTO,
  seedProjectListDTO,
  seedProjectTeamDTO,
  seedAssignableMembersDTO,
} from '@/tests/fixtures'

import {
  mapAssignableMemberResponseDTOToAssignableMember,
  mapPageOfProjectActivity,
  mapPageOfProjects,
  mapProjectActivityDTOToProjectActivity,
  mapProjectBudgetResponseDTOToProjectBudget,
  mapProjectDTOArrayToProjects,
  mapProjectDTOToProject,
  mapProjectDetailDTOToProjectDetail,
  mapProjectMemberArrayToProjectMembers,
  mapProjectMemberResponseDTOToProjectMember,
} from './project-mappers'

describe('mapProjectDTOToProject', () => {
  it('maps the seeded Torre project field by field', () => {
    const dto = seedProjectDTO(DEFAULT_SEED_PROJECT_ID)

    const project = mapProjectDTOToProject(dto)

    expect(project.id).toBe(DEFAULT_SEED_PROJECT_ID)
    expect(project.organizationId).toBe(dto.organization_id)
    expect(project.name).toBe('Torre Residencial Norte')
    expect(project.description).toBe(dto.description)
    expect(project.location).toBe(dto.location)
    // Pin the seed facts: the `as` casts must land the known members, not
    // whatever happens to sit in the neighbouring column.
    expect(project.status).toBe('on_track')
    expect(project.priority).toBe('high')
    expect(project.budget).toBe(850000)
    expect(project.allocated).toBe(580000)
    expect(project.spent).toBe(637000)
    expect(project.managerId).toBe(dto.manager_id)
    expect(project.managerName).toBe(dto.manager_name)
    expect(project.isDraft).toBe(false)
    expect(project.progress).toBe(dto.progress)
    expect(project.startDate).toBe(dto.start_date)
    expect(project.dueDate).toBe(dto.due_date)
    expect(project.isOverBudget).toBe(dto.is_over_budget)
    expect(project.createdAt).toBe(dto.created_at)
  })

  it('keeps a null budget null rather than coercing it to 0', () => {
    const dto = seedProjectDTO(DEFAULT_SEED_PROJECT_ID, { budget: null })

    expect(mapProjectDTOToProject(dto).budget).toBeNull()
  })

  it('reads the currency, and a project from before it as USD (BUD-10)', () => {
    const pesos = seedProjectDTO(DEFAULT_SEED_PROJECT_ID, { currency: 'CLP' })
    const legacy = seedProjectDTO(DEFAULT_SEED_PROJECT_ID)

    expect(mapProjectDTOToProject(pesos).currency).toBe('CLP')
    expect(mapProjectDTOToProject(legacy).currency).toBe('USD')
  })
})

describe('assignable member mapping', () => {
  it('maps a row field by field, badge facts included', () => {
    const dto = seedAssignableMembersDTO(DEFAULT_SEED_PROJECT_ID)[0]

    const member = mapAssignableMemberResponseDTOToAssignableMember(dto)

    expect(member.userId).toBe(dto.user_id)
    expect(member.memberName).toBe(dto.member_name)
    expect(member.memberEmail).toBe(dto.member_email)
    expect(member.roleSlug).toBe(dto.role_slug)
    expect(member.isProjectMember).toBe(dto.is_project_member)
  })

  it('drops a slug this build has no label for, rather than badging a raw key', () => {
    const dto = {
      ...seedAssignableMembersDTO(DEFAULT_SEED_PROJECT_ID)[0],
      role_slug: 'site_supervisor',
    }

    const member = mapAssignableMemberResponseDTOToAssignableMember(dto)

    // Still offered — the person is assignable either way; only the badge goes.
    expect(member.roleSlug).toBeNull()
    expect(member.userId).toBe(dto.user_id)
  })
})

describe('project member mapping', () => {
  it('maps a member row field by field', () => {
    const dto = seedProjectTeamDTO(DEFAULT_SEED_PROJECT_ID)[0]

    const member = mapProjectMemberResponseDTOToProjectMember(dto)

    expect(member.id).toBe(dto.id)
    expect(member.userId).toBe(dto.user_id)
    expect(member.memberName).toBe(dto.member_name)
    expect(member.memberEmail).toBe(dto.member_email)
    expect(member.isManager).toBe(dto.is_manager)
    expect(member.joinedAt).toBe(dto.joined_at)
  })

  it('preserves which member is the manager across the array mapper', () => {
    const dtos = seedProjectTeamDTO(DEFAULT_SEED_PROJECT_ID)

    const members = mapProjectMemberArrayToProjectMembers(dtos)

    expect(members).toHaveLength(dtos.length)
    const manager = members.find((member) => member.isManager)
    expect(manager?.userId).toBe(seedProject(DEFAULT_SEED_PROJECT_ID).managerId)
  })
})

describe('mapProjectDetailDTOToProjectDetail', () => {
  it('extends the project shape with mapped members', () => {
    const dto = seedProjectDetailDTO(DEFAULT_SEED_PROJECT_ID)

    const detail = mapProjectDetailDTOToProjectDetail(dto)

    expect(detail.id).toBe(DEFAULT_SEED_PROJECT_ID)
    expect(detail.status).toBe('on_track')
    expect(detail.members).toHaveLength(dto.members.length)
    expect(detail.members.map((member) => member.userId)).toEqual(
      dto.members.map((member) => member.user_id),
    )
  })
})

describe('mapProjectBudgetResponseDTOToProjectBudget', () => {
  it('parses every money string and keeps the derived flags', () => {
    const dto = seedProjectBudgetDTO(DEFAULT_SEED_PROJECT_ID)

    const budget = mapProjectBudgetResponseDTOToProjectBudget(dto)

    expect(budget.projectId).toBe(DEFAULT_SEED_PROJECT_ID)
    expect(budget.budget).toBe(850000)
    expect(budget.allocated).toBe(Number(dto.allocated))
    expect(budget.unallocated).toBe(Number(dto.unallocated))
    expect(budget.spent).toBe(Number(dto.spent))
    expect(budget.remaining).toBe(Number(dto.remaining))
    expect(budget.isOverBudget).toBe(dto.is_over_budget)
    expect(budget.utilizationPercentage).toBe(dto.utilization_percentage)
  })

  it('keeps a null budget null', () => {
    const dto = {
      ...seedProjectBudgetDTO(DEFAULT_SEED_PROJECT_ID),
      budget: null,
    }

    expect(mapProjectBudgetResponseDTOToProjectBudget(dto).budget).toBeNull()
  })
})

describe('array and page mappers', () => {
  it('accepts both a bare array and an items envelope', () => {
    const dtos = seedProjectListDTO()

    const fromArray = mapProjectDTOArrayToProjects(dtos)
    const fromEnvelope = mapProjectDTOArrayToProjects({ items: dtos })

    expect(fromArray).toHaveLength(dtos.length)
    expect(fromEnvelope).toHaveLength(dtos.length)
    expect(fromArray.map((project) => project.id)).toEqual(
      fromEnvelope.map((project) => project.id),
    )
  })

  it('maps the page envelope fields, not just the items', () => {
    const items = seedProjectListDTO()

    const page = mapPageOfProjects({
      items,
      total: 6,
      page: 1,
      page_size: 20,
      total_pages: 1,
    })

    expect(page.items).toHaveLength(items.length)
    expect(page.items[0].name).toBe(items[0].name)
    expect(page.total).toBe(6)
    expect(page.page).toBe(1)
    expect(page.pageSize).toBe(20)
    expect(page.totalPages).toBe(1)
  })
})

describe('project activity mapping', () => {
  it('maps a human-actored row field by field', () => {
    const dto = seedProjectActivityListDTO()[0]

    const activity = mapProjectActivityDTOToProjectActivity(dto)

    expect(activity.id).toBe(dto.id)
    expect(activity.occurredAt).toBe(dto.occurred_at)
    expect(activity.actorId).toBe(dto.actor_id)
    expect(activity.actorName).toBe(dto.actor_name)
    expect(activity.action).toBe('task.completed')
    expect(activity.entityType).toBe('task')
    expect(activity.entityId).toBe(dto.entity_id)
    expect(activity.entityName).toBe(dto.entity_name)
    expect(activity.oldValue).toBe(dto.old_value)
    expect(activity.newValue).toBe(dto.new_value)
  })

  it('keeps a system cascade actorless (null actor fields)', () => {
    const cascade = seedProjectActivityListDTO().find(
      (row) => row.actor_id === null,
    )
    expect(cascade).toBeDefined()

    const activity = mapProjectActivityDTOToProjectActivity(cascade!)

    expect(activity.actorId).toBeNull()
    expect(activity.actorName).toBeNull()
    expect(activity.action).toBe('task.unblocked')
  })

  it('maps the activity page envelope', () => {
    const dto = seedProjectActivityPageDTO(seedProjectActivityListDTO(), {
      total: 40,
      page: 2,
      pageSize: 25,
    })

    const page = mapPageOfProjectActivity(dto)

    expect(page.items).toHaveLength(dto.items.length)
    expect(page.items[0].occurredAt).toBe(dto.items[0].occurred_at)
    expect(page.total).toBe(40)
    expect(page.page).toBe(2)
    expect(page.pageSize).toBe(25)
    expect(page.totalPages).toBe(dto.total_pages)
  })
})
