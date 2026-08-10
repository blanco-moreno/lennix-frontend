import {
  DEFAULT_SEED_PROJECT_ID,
  seedCriticalPathSummaryDTO,
} from '@/tests/fixtures'

import { mapCriticalPathSummaryResponseDTOToCriticalPathSummary } from './analytics-mapper'

describe('mapCriticalPathSummaryResponseDTOToCriticalPathSummary', () => {
  it('maps top-level counters', () => {
    const dto = seedCriticalPathSummaryDTO(DEFAULT_SEED_PROJECT_ID, {
      total_critical_paths: 4,
      active_critical_paths: 2,
    })

    const result = mapCriticalPathSummaryResponseDTOToCriticalPathSummary(dto)

    expect(result.totalCriticalPaths).toBe(4)
    expect(result.activeCriticalPaths).toBe(2)
    expect(result.criticalPaths).toHaveLength(dto.critical_paths.length)
  })

  it('maps snake_case → camelCase on every nested path', () => {
    const dto = seedCriticalPathSummaryDTO(DEFAULT_SEED_PROJECT_ID)
    const path = dto.critical_paths[0]

    const result = mapCriticalPathSummaryResponseDTOToCriticalPathSummary(dto)
    const mapped = result.criticalPaths[0]

    expect(mapped.id).toBe(path.id)
    expect(mapped.projectId).toBe(path.project_id)
    expect(mapped.code).toBe(path.code)
    expect(mapped.originTaskId).toBe(path.origin_task_id)
    expect(mapped.delayDays).toBe(path.delay_days)
    expect(mapped.delayCategory).toBe(path.delay_category)
    expect(mapped.affectedCount).toBe(path.affected_count)
    expect(mapped.isActive).toBe(path.is_active)
    expect(mapped.createdAt).toBe(path.created_at)
  })

  it('maps every node inside impact_chain', () => {
    const dto = seedCriticalPathSummaryDTO(DEFAULT_SEED_PROJECT_ID)
    const sourceChain = dto.critical_paths[0].impact_chain

    const result = mapCriticalPathSummaryResponseDTOToCriticalPathSummary(dto)
    const chain = result.criticalPaths[0].impactChain

    expect(chain).toHaveLength(sourceChain.length)
    chain.forEach((node, idx) => {
      const sourceNode = sourceChain[idx]
      expect(node.taskId).toBe(sourceNode.task_id)
      expect(node.title).toBe(sourceNode.title)
      expect(node.status).toBe(sourceNode.status)
      expect(node.startDate).toBe(sourceNode.start_date)
      expect(node.dueDate).toBe(sourceNode.due_date)
      expect(node.delayDays).toBe(sourceNode.delay_days)
      expect(node.delayReason).toBe(sourceNode.delay_reason)
      expect(node.isBlocked).toBe(sourceNode.is_blocked)
    })
  })

  it('handles a summary with no critical paths', () => {
    const dto = seedCriticalPathSummaryDTO(DEFAULT_SEED_PROJECT_ID, {
      total_critical_paths: 0,
      active_critical_paths: 0,
      critical_paths: [],
    })

    const result = mapCriticalPathSummaryResponseDTOToCriticalPathSummary(dto)

    expect(result.totalCriticalPaths).toBe(0)
    expect(result.activeCriticalPaths).toBe(0)
    expect(result.criticalPaths).toEqual([])
  })
})
