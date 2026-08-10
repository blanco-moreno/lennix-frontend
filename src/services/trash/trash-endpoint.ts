import type { TrashKind } from '@/types'

const BASE = '/v1/trash'

const PLURAL_PATH: Record<TrashKind, string> = {
  project: 'projects',
  task: 'tasks',
  expense: 'expenses',
}

export const listTrashedProjects = `${BASE}/projects`
export const listTrashedTasks = `${BASE}/tasks`
export const listTrashedExpenses = `${BASE}/expenses`

export function restoreTrashed(kind: TrashKind, id: string): string {
  return `${BASE}/${PLURAL_PATH[kind]}/${id}/restore`
}

export function purgeTrashed(kind: TrashKind, id: string): string {
  return `${BASE}/${PLURAL_PATH[kind]}/${id}`
}

export const bulkPurgeTrashed = `${BASE}/bulk-purge`
