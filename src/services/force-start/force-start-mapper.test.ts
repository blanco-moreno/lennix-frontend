import {
  seedForceStartRequestDTO,
  seedPendingForceStartRequestDTO,
} from '@/tests/fixtures'
import { SEED_FORCE_START, SEED_IDS } from '@/tests/seed'

import { mapForceStartRequestDTO, snapshotTitle } from './force-start-mapper'

describe('mapForceStartRequestDTO', () => {
  it('maps the seeded approved request field by field (D4/D24)', () => {
    const dto = seedForceStartRequestDTO()

    const request = mapForceStartRequestDTO(dto)

    expect(request.id).toBe(SEED_IDS.FORCE_START_REQUEST_ID)
    expect(request.taskId).toBe(SEED_IDS.P1_TASK_FORCE_STARTED)
    expect(request.reason).toBe(SEED_FORCE_START.request.reason)
    expect(request.state).toBe('approved')
    expect(request.requestorId).toBe(SEED_FORCE_START.request.requestorId)
    expect(request.decidedBy).toBe(SEED_FORCE_START.request.decidedBy)
    expect(request.decidedAt).toBe(SEED_FORCE_START.request.decidedAt)
    expect(request.decisionComment).toBe(
      SEED_FORCE_START.request.decisionComment,
    )
    expect(request.stateSnapshot).toEqual(dto.state_snapshot)
    expect(request.createdAt).toBe(dto.created_at)
    expect(request.updatedAt).toBe(dto.updated_at)
  })

  it('keeps a pending request undecided (null decision fields)', () => {
    const request = mapForceStartRequestDTO(seedPendingForceStartRequestDTO())

    expect(request.state).toBe('pending')
    expect(request.decidedBy).toBeNull()
    expect(request.decidedAt).toBeNull()
    expect(request.decisionComment).toBeNull()
  })
})

describe('page of requests', () => {
  it('maps one page one to one through the item mapper', () => {
    const dtos = [seedForceStartRequestDTO(), seedPendingForceStartRequestDTO()]

    const requests = dtos.map(mapForceStartRequestDTO)

    expect(requests).toHaveLength(2)
    expect(requests.map((request) => request.state)).toEqual([
      'approved',
      'pending',
    ])
  })
})

describe('snapshotTitle', () => {
  it('reads the target title from the audit snapshot', () => {
    const dto = seedForceStartRequestDTO()

    expect(snapshotTitle(dto.state_snapshot)).toBe(
      SEED_FORCE_START.forced.title,
    )
  })

  it('falls back to a dash for a snapshot without a usable title', () => {
    expect(snapshotTitle({})).toBe('—')
    expect(snapshotTitle({ title: '' })).toBe('—')
    expect(snapshotTitle({ title: 42 })).toBe('—')
  })
})
