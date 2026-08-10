import {
  clampLag,
  dependencyTypeFor,
  evaluateLink,
  linkCandidates,
  MAX_LAG_DAYS,
} from './edge-rules'

const phaseA = { parentId: null }
const phaseB = { parentId: null }
const activityA1 = { parentId: 'a' }
const activityA2 = { parentId: 'a' }
const activityB1 = { parentId: 'b' }

describe('dependencyTypeFor', () => {
  it('mirrors the only two pairings the backend accepts', () => {
    expect(dependencyTypeFor(phaseA, phaseB)).toBe('inter_phase')
    expect(dependencyTypeFor(activityA1, activityA2)).toBe('intra_phase')
  })

  it('refuses a cross-phase or mixed-level pair instead of inviting a 400', () => {
    expect(dependencyTypeFor(activityA1, activityB1)).toBeNull()
    expect(dependencyTypeFor(activityA1, phaseB)).toBeNull()
    expect(dependencyTypeFor(phaseA, activityB1)).toBeNull()
  })
})

describe('evaluateLink', () => {
  const rows = new Map([
    ['a', { parentId: null }],
    ['b', { parentId: null }],
    ['a1', { parentId: 'a' }],
    ['b1', { parentId: 'b' }],
  ])

  it('accepts a legal, new pair and names its dependency type', () => {
    expect(
      evaluateLink({ predecessorId: 'a', successorId: 'b' }, rows, []),
    ).toEqual({
      ok: true,
      dependencyType: 'inter_phase',
      reason: null,
      viaId: null,
    })
  })

  it('rejects a self link', () => {
    expect(
      evaluateLink({ predecessorId: 'a', successorId: 'a' }, rows, []).reason,
    ).toBe('self')
  })

  it('rejects an illegal pairing and an unknown row alike', () => {
    expect(
      evaluateLink({ predecessorId: 'a1', successorId: 'b1' }, rows, []).reason,
    ).toBe('pairing')
    expect(
      evaluateLink({ predecessorId: 'ghost', successorId: 'a' }, rows, [])
        .reason,
    ).toBe('pairing')
  })

  it('rejects an edge that already exists, in that direction', () => {
    const existing = [{ taskId: 'b', dependsOnId: 'a' }]
    expect(
      evaluateLink({ predecessorId: 'a', successorId: 'b' }, rows, existing)
        .reason,
    ).toBe('duplicate')
  })

  // The inverse of an edge visible three rows above: caught here, not by a
  // server 409 after the click.
  it('rejects the inverse of an existing edge as the two-row loop it is', () => {
    const verdict = evaluateLink(
      { predecessorId: 'b', successorId: 'a' },
      rows,
      [{ taskId: 'b', dependsOnId: 'a' }],
    )
    expect(verdict.reason).toBe('cycle')
    expect(verdict.viaId).toBeNull()
  })

  it('rejects a longer loop and names the hop that proves it', () => {
    const chain = new Map([
      ['a', { parentId: null }],
      ['b', { parentId: null }],
      ['c', { parentId: null }],
    ])
    // a → b → c, so linking c → a closes the ring.
    const existing = [
      { taskId: 'b', dependsOnId: 'a' },
      { taskId: 'c', dependsOnId: 'b' },
    ]
    const verdict = evaluateLink(
      { predecessorId: 'c', successorId: 'a' },
      chain,
      existing,
    )
    expect(verdict.reason).toBe('cycle')
    expect(verdict.viaId).toBe('b')
  })

  it('leaves a chain that only converges alone — a diamond is not a loop', () => {
    const diamond = new Map([
      ['a', { parentId: null }],
      ['b', { parentId: null }],
      ['c', { parentId: null }],
    ])
    // b and c both wait on a; linking c → b joins them without closing a ring.
    const existing = [
      { taskId: 'b', dependsOnId: 'a' },
      { taskId: 'c', dependsOnId: 'a' },
    ]
    expect(
      evaluateLink({ predecessorId: 'c', successorId: 'b' }, diamond, existing)
        .ok,
    ).toBe(true)
  })
})

describe('linkCandidates', () => {
  const rows = [
    { id: 'a', title: 'Excavación', parentId: null },
    { id: 'b', title: 'Encofrado', parentId: null },
    { id: 'c', title: 'Hormigonado', parentId: null },
    { id: 'a1', title: 'Replanteo', parentId: 'a' },
  ]
  const existing = [{ taskId: 'b', dependsOnId: 'a' }]

  it('keeps every refused row, with its reason, instead of dropping it', () => {
    const candidates = linkCandidates({
      pivotId: 'b',
      direction: 'upstream',
      rows,
      existing,
    })

    expect(candidates.map((candidate) => candidate.id)).toEqual([
      'c',
      'a',
      'a1',
    ])
    expect(candidates.map((candidate) => candidate.verdict.reason)).toEqual([
      null,
      'duplicate',
      'pairing',
    ])
  })

  it('never offers the pivot itself', () => {
    const candidates = linkCandidates({
      pivotId: 'b',
      direction: 'downstream',
      rows,
      existing,
    })

    expect(candidates.some((candidate) => candidate.id === 'b')).toBe(false)
  })

  it('refuses, on the successor side, a row this one already waits for', () => {
    const candidates = linkCandidates({
      pivotId: 'b',
      direction: 'downstream',
      rows,
      existing,
    })

    expect(
      candidates.find((candidate) => candidate.id === 'a')?.verdict.reason,
    ).toBe('cycle')
  })

  it('resolves the hop of a longer loop to a title the picker can print', () => {
    const candidates = linkCandidates({
      pivotId: 'a',
      direction: 'upstream',
      rows,
      existing: [
        { taskId: 'b', dependsOnId: 'a' },
        { taskId: 'c', dependsOnId: 'b' },
      ],
    })

    // 'a' already runs ahead of b, and b ahead of c. Making 'a' wait on 'c'
    // would close the ring a → b → c → a.
    const candidate = candidates.find((entry) => entry.id === 'c')
    expect(candidate?.verdict.reason).toBe('cycle')
    expect(candidate?.via).toBe('Encofrado')
  })
})

describe('clampLag', () => {
  it('keeps lag inside the bound the backend enforces', () => {
    expect(clampLag(4000)).toBe(MAX_LAG_DAYS)
    expect(clampLag(-4000)).toBe(-MAX_LAG_DAYS)
    expect(clampLag(-3)).toBe(-3)
  })

  it('treats a non-number as no lag rather than as NaN days', () => {
    expect(clampLag(Number.NaN)).toBe(0)
    expect(clampLag(2.7)).toBe(2)
  })
})
