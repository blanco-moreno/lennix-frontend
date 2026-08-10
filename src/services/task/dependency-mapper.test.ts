import {
  DEFAULT_SEED_PROJECT_ID,
  seedDependencyChainDTO,
  seedTaskDependencyDTO,
} from '@/tests/fixtures'
import { SEED_IDS } from '@/tests/seed'

import {
  mapDependencyChainResponseDTOToDependencyChain,
  mapTaskDependencyResponseDTOToTaskDependency,
} from './dependency-mapper'

describe('mapTaskDependencyResponseDTOToTaskDependency', () => {
  it('maps the created edge field by field', () => {
    const dto = seedTaskDependencyDTO()

    const edge = mapTaskDependencyResponseDTOToTaskDependency(dto)

    expect(edge.id).toBe(dto.id)
    expect(edge.taskId).toBe(SEED_IDS.P1_TASK_STRUCTURE)
    expect(edge.dependsOnId).toBe(SEED_IDS.P1_TASK_FOUNDATION)
    expect(edge.dependencyType).toBe('inter_phase')
    expect(edge.relationshipType).toBe('FS')
    expect(edge.lagDays).toBe(0)
    expect(edge.createdAt).toBe(dto.created_at)
  })

  it('does not swap the direction of the edge', () => {
    const dto = seedTaskDependencyDTO({
      task_id: SEED_IDS.P1_TASK_FINISHES,
      depends_on_id: SEED_IDS.P1_TASK_INSTALLATIONS,
      lag_days: 3,
    })

    const edge = mapTaskDependencyResponseDTOToTaskDependency(dto)

    expect(edge.taskId).toBe(SEED_IDS.P1_TASK_FINISHES)
    expect(edge.dependsOnId).toBe(SEED_IDS.P1_TASK_INSTALLATIONS)
    expect(edge.lagDays).toBe(3)
  })
})

describe('mapDependencyChainResponseDTOToDependencyChain', () => {
  it('maps every inter-phase node with its nested tasks', () => {
    const dto = seedDependencyChainDTO(DEFAULT_SEED_PROJECT_ID)

    const chain = mapDependencyChainResponseDTOToDependencyChain(dto)

    expect(chain.interPhase).toHaveLength(dto.inter_phase.length)
    expect(chain.interPhase.length).toBeGreaterThan(0)
    chain.interPhase.forEach((node, idx) => {
      const source = dto.inter_phase[idx]
      expect(node.id).toBe(source.id)
      expect(node.relationshipType).toBe(source.relationship_type)
      expect(node.lagDays).toBe(source.lag_days)
      expect(node.isBroken).toBe(source.is_broken)
      expect(node.task.id).toBe(source.task.id)
      expect(node.task.title).toBe(source.task.title)
      expect(node.task.status).toBe(source.task.status)
      expect(node.task.priority).toBe(source.task.priority)
      expect(node.task.progress).toBe(source.task.progress)
      expect(node.task.startDate).toBe(source.task.start_date)
      expect(node.task.dueDate).toBe(source.task.due_date)
      expect(node.task.delayDays).toBe(source.task.delay_days)
      expect(node.task.isBlocked).toBe(source.task.is_blocked)
      expect(node.dependsOn?.id).toBe(source.depends_on?.id)
    })
  })

  it('groups intra-phase nodes under the same parent keys as the wire', () => {
    const dto = seedDependencyChainDTO(DEFAULT_SEED_PROJECT_ID)

    const chain = mapDependencyChainResponseDTOToDependencyChain(dto)

    expect(Object.keys(chain.intraPhase).sort()).toEqual(
      Object.keys(dto.intra_phase).sort(),
    )
    for (const [key, nodes] of Object.entries(dto.intra_phase)) {
      expect(chain.intraPhase[key]).toHaveLength(nodes.length)
      expect(chain.intraPhase[key].map((node) => node.task.id)).toEqual(
        nodes.map((node) => node.task.id),
      )
    }
  })

  it('keeps the broken edge and the identity of its deleted upstream (D5/D18)', () => {
    const chain = mapDependencyChainResponseDTOToDependencyChain(
      seedDependencyChainDTO(DEFAULT_SEED_PROJECT_ID),
    )

    const broken = chain.interPhase.find((node) => node.isBroken)

    expect(broken).toBeDefined()
    expect(broken?.task.id).toBe(SEED_IDS.P1_TASK_BROKEN_DEPENDENT)
    expect(broken?.dependsOn?.id).toBe(SEED_IDS.P1_TASK_BROKEN_UPSTREAM)
  })

  it('maps a null depends_on to null (edge with no predecessor left)', () => {
    const dto = seedDependencyChainDTO(DEFAULT_SEED_PROJECT_ID)
    dto.inter_phase[0] = { ...dto.inter_phase[0], depends_on: null }

    const chain = mapDependencyChainResponseDTOToDependencyChain(dto)

    expect(chain.interPhase[0].dependsOn).toBeNull()
  })
})
