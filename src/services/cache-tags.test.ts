import {
  providesListTags,
  providesPageTags,
  providesScopedListTags,
  scopeTagTypes,
} from './cache-tags'

describe('providesListTags', () => {
  const provider = providesListTags<{ id: string }>('Task')

  it('tags every row by id and appends the LIST sentinel', () => {
    expect(provider([{ id: 'a' }, { id: 'b' }])).toEqual([
      { type: 'Task', id: 'a' },
      { type: 'Task', id: 'b' },
      { type: 'Task', id: 'LIST' },
    ])
  })

  it('still provides the LIST sentinel when the query failed', () => {
    // Without it, a mutation could never trigger the retry of a failed list.
    expect(provider(undefined)).toEqual([{ type: 'Task', id: 'LIST' }])
  })
})

describe('providesPageTags', () => {
  const provider = providesPageTags<{ id: number }>('Expense')

  it('reads rows from the paginated envelope, not the envelope itself', () => {
    expect(provider({ items: [{ id: 1 }] })).toEqual([
      { type: 'Expense', id: 1 },
      { type: 'Expense', id: 'LIST' },
    ])
  })

  it('falls back to the LIST sentinel on a missing page', () => {
    expect(provider(undefined)).toEqual([{ type: 'Expense', id: 'LIST' }])
  })
})

describe('providesScopedListTags', () => {
  const provider = providesScopedListTags<{ id: string }>('Task', 'project')

  it('scopes the sentinel to the parent, so sibling scopes stay cached', () => {
    expect(provider([{ id: 't1' }], undefined, 'p9')).toEqual([
      { type: 'Task', id: 't1' },
      { type: 'Task', id: 'project-p9' },
    ])
  })

  it('keeps the scoped sentinel (not a broad LIST) when the query failed', () => {
    // A broad sentinel here would make any task mutation refetch every
    // project's list.
    expect(provider(undefined, undefined, 'p9')).toEqual([
      { type: 'Task', id: 'project-p9' },
    ])
  })
})

describe('scopeTagTypes', () => {
  it('id-scopes every type when an id is given', () => {
    expect(scopeTagTypes(['Dependency', 'Task'], 'x')).toEqual([
      { type: 'Dependency', id: 'x' },
      { type: 'Task', id: 'x' },
    ])
  })

  it('emits broad (id-less) tags when no id is given', () => {
    const tags = scopeTagTypes(['Dependency', 'Task'])
    expect(tags).toEqual([{ type: 'Dependency' }, { type: 'Task' }])
    // Broad means no id key at all — `{ id: undefined }` matches differently
    // in RTK Query.
    expect(Object.keys(tags[0])).toEqual(['type'])
  })
})
