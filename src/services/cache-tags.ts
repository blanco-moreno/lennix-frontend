// RTK Query cache-tag infrastructure: the tag registry, invalidation groups,
// and the providesTags/invalidatesTags factories the service files share.

// --- Tag registry ---

export const CACHE_TAG_TYPES = [
  'BudgetApproval',
  'BudgetVariance',
  'CompletionStats',
  'CostReport',
  'CriticalPath',
  'Dashboard',
  'DelayAnalysis',
  'Dependency',
  'Expense',
  'ForceStartRequest',
  'ImportJob',
  'OrgDashboard',
  'OrgMembers',
  'OrgUsage',
  'Organization',
  'Project',
  'ProjectActivity',
  'ProjectBudget',
  'ProjectTeam',
  'Risk',
  'ScheduleReviewState',
  'Subtask',
  'Task',
  'Trash',
  'User',
] as const

export type AppTagType = (typeof CACHE_TAG_TYPES)[number]

type CacheTag = AppTagType | { type: AppTagType; id?: string | number }

// --- Invalidation groups ---

// Tags invalidated when schedule or dependency graph changes
export const SCHEDULE_INVALIDATION_TAGS: readonly AppTagType[] = [
  'CriticalPath',
  'Dependency',
  'Dashboard',
  'CompletionStats',
  'DelayAnalysis',
]

export interface ExpenseScope {
  subtaskId?: string | null
  taskId?: string | null
  projectId: string
}

// Build the actual id-scoped tags affected by an expense mutation.
// Without ids these wouldn't match queries that provide tags like
// `{type:'Expense', id:'subtask-XYZ'}`, so RTK Query would skip the refetch.
export function buildExpenseInvalidationTags({
  subtaskId,
  taskId,
  projectId,
}: ExpenseScope): { type: AppTagType; id: string }[] {
  const tags: { type: AppTagType; id: string }[] = [
    { type: 'Expense', id: `project-${projectId}` },
    { type: 'CostReport', id: projectId },
    { type: 'Task', id: `project-${projectId}` },
    { type: 'ProjectBudget', id: projectId },
    { type: 'Project', id: projectId },
    { type: 'Dashboard', id: projectId },
    // Every consumer of this builder (expense create/update/delete, subtask
    // delete) writes a Historial row on the backend.
    { type: 'ProjectActivity', id: projectId },
    // Metered storage quota is updated on attachment/expense mutations
    { type: 'OrgUsage', id: 'current' },
  ]
  if (subtaskId) {
    tags.push({ type: 'Expense', id: `subtask-${subtaskId}` })
    tags.push({ type: 'Subtask', id: subtaskId })
  }
  if (taskId) {
    tags.push({ type: 'BudgetVariance', id: taskId })
    tags.push({ type: 'Task', id: taskId })
  }
  return tags
}

// Tags invalidated when a dependency edge is created, edited or removed, all
// scoped to the edge's project. A draft's edges live in its review state, and
// every edge write lands a row in the project record.
export function buildDependencyInvalidationTags(
  taskId: string,
  projectId: string,
): CacheTag[] {
  return [
    // The successor's own row — its blocked/critical state derives from edges.
    { type: 'Task', id: taskId },
    { type: 'Task', id: `project-${projectId}` },
    { type: 'ProjectActivity', id: projectId },
    ...scopeTagTypes(
      [
        'Dependency',
        'CriticalPath',
        'Dashboard',
        'DelayAnalysis',
        'ScheduleReviewState',
      ],
      projectId,
    ),
  ]
}

// --- providesTags / invalidatesTags builders ---

export function providesListTags<T extends { id: string | number }>(
  tagType: AppTagType,
) {
  return (result: T[] | undefined): CacheTag[] =>
    result
      ? [
          ...result.map(({ id }): CacheTag => ({ type: tagType, id })),
          { type: tagType, id: 'LIST' },
        ]
      : [{ type: tagType, id: 'LIST' }]
}

export function providesPageTags<T extends { id: string | number }>(
  tagType: AppTagType,
) {
  return (result: { items: T[] } | undefined): CacheTag[] =>
    result
      ? [
          ...result.items.map(({ id }): CacheTag => ({ type: tagType, id })),
          { type: tagType, id: 'LIST' },
        ]
      : [{ type: tagType, id: 'LIST' }]
}

export function providesScopedListTags<T extends { id: string | number }>(
  tagType: AppTagType,
  scopePrefix: string,
) {
  return (
    result: T[] | undefined,
    _error: unknown,
    scopeId: string,
  ): CacheTag[] =>
    result
      ? [
          ...result.map(({ id }): CacheTag => ({ type: tagType, id })),
          { type: tagType, id: `${scopePrefix}-${scopeId}` },
        ]
      : [{ type: tagType, id: `${scopePrefix}-${scopeId}` }]
}

export function scopeTagTypes(
  types: readonly AppTagType[],
  id?: string,
): CacheTag[] {
  return types.map((type) => (id ? { type, id } : { type }))
}
