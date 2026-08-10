/**
 * The URL vocabulary of the filtered lists (`/projects`, `/tasks`, and the
 * assigned queue), and the pure parse/serialize pair around it.
 *
 * A filtered listing is an address, not component state: the same rule the
 * tabs, the task panel and the papelera's page already follow. Filters kept in
 * Redux could not be pasted into Slack and did not survive a reload; here the
 * URL is the single source of truth and this module is the only place that
 * knows how to read and write it.
 *
 * Three properties this file exists to hold:
 * - **Parsing never throws and never forwards garbage.** A hand-edited
 *   `?page=abc`, a stale `?status=invented`, a `?page_size=999` degrade to the
 *   default. Anything else turns a bad link into a 422 the user cannot read.
 * - **A default is not written.** The clean URL is the unfiltered URL; writing
 *   `?status=all&page=1` makes "share this listing" meaningless.
 * - **The URL vocabulary is not the wire vocabulary.** These names are chosen
 *   to be read by a human (`?blocked=true`); each surface translates them into
 *   its endpoint's own argument names where it calls it.
 */

import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@/constants'
import type {
  ProjectSortBy,
  ProjectStatus,
  TaskPriority,
  TaskSortBy,
  TaskStatus,
} from '@/types'

import { AT_RISK_LENS, TASK_RISK_PARAM } from './at-risk-lens'

/**
 * Which list is being addressed. The surfaces share one vocabulary but not one
 * parameter set — `?critical=` means nothing to `/projects`, and forwarding it
 * would be a 422 — so the surface decides which keys are read and emitted.
 */
export type ListSurface = 'projects' | 'tasks' | 'assigned'

export interface ListQueryState {
  search: string
  status: ProjectStatus | TaskStatus | null
  project: string | null
  priority: TaskPriority | null
  /** The person the rows belong to: the obra's manager, the activity's assignee. */
  assignee: string | null
  risk: typeof AT_RISK_LENS | null
  blocked: boolean | null
  overBudget: boolean | null
  critical: boolean | null
  dueAfter: string | null
  dueBefore: string | null
  /**
   * A sort key of the surface, `-` prefixed for descending. Typed as the union
   * of both surfaces' contracts because parsing already refused everything
   * else — which is what lets a caller hand it to its endpoint uncast.
   */
  sort: ProjectSortBy | TaskSortBy | null
  page: number
  pageSize: number
}

/** Everything a user can narrow by — `sort`, `page` and `pageSize` are not filters. */
export type ListFilterKey = Exclude<
  keyof ListQueryState,
  'sort' | 'page' | 'pageSize'
>

/**
 * The URL spelling of each piece of state.
 *
 * Short and readable, because these end up in a pasted link. `risk` is the
 * lens `at-risk-lens.ts` already defined and the KPI tile already links to —
 * reused rather than renamed, so the two cannot drift apart.
 */
export const LIST_PARAMS = {
  search: 'search',
  status: 'status',
  project: 'project',
  priority: 'priority',
  assignee: 'assignee',
  risk: TASK_RISK_PARAM,
  blocked: 'blocked',
  overBudget: 'over_budget',
  critical: 'critical',
  dueAfter: 'due_after',
  dueBefore: 'due_before',
  sort: 'sort',
  page: 'page',
  pageSize: 'page_size',
} as const satisfies Record<keyof ListQueryState, string>

const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'on_track',
  'delayed',
  'ahead',
  'completed',
  'archived',
]

const TASK_STATUSES: readonly TaskStatus[] = [
  'todo',
  'in_progress',
  'done',
  'cancelled',
]

const PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high']

/** Sort keys `GET /v1/projects` accepts, before the descending `-` prefix. */
export const PROJECT_SORT_KEYS = [
  'created_at',
  'name',
  'due_date',
  'priority',
  'progress',
] as const

/** Sort keys the `/v1/tasks` listings accept, before the descending `-` prefix. */
export const TASK_SORT_KEYS = [
  'created_at',
  'due_date',
  'title',
  'priority',
  'delay_days',
] as const

function withDescending(keys: readonly string[]): readonly string[] {
  return keys.flatMap((key) => [key, `-${key}`])
}

const SORT_KEYS: Record<ListSurface, readonly string[]> = {
  projects: withDescending(PROJECT_SORT_KEYS),
  tasks: withDescending(TASK_SORT_KEYS),
  assigned: withDescending(TASK_SORT_KEYS),
}

const STATUSES: Record<ListSurface, readonly string[]> = {
  projects: PROJECT_STATUSES,
  tasks: TASK_STATUSES,
  assigned: TASK_STATUSES,
}

/**
 * The filters each surface answers, transcribed from the backend's query
 * parameters. A key absent here is dropped on parse, so a link carrying a
 * filter this list cannot use lands on an unfiltered list instead of an error.
 */
const SURFACE_FILTERS: Record<ListSurface, readonly ListFilterKey[]> = {
  projects: [
    'search',
    'status',
    'priority',
    'assignee',
    'overBudget',
    'dueAfter',
    'dueBefore',
  ],
  tasks: [
    'search',
    'status',
    'project',
    'priority',
    'assignee',
    'risk',
    'blocked',
    'overBudget',
    'critical',
    'dueAfter',
    'dueBefore',
  ],
  assigned: [
    'search',
    'status',
    'project',
    'priority',
    'risk',
    'blocked',
    'dueAfter',
    'dueBefore',
  ],
}

/**
 * Which controls a surface's filter bar carries, in the order they read.
 *
 * The bar renders from this rather than from a hand-written list per view:
 * two lists is how `/projects` and `/tasks` grow different answers to the same
 * control, and how a control can end up on a bar whose endpoint 422s on it.
 */
export function listSurfaceFilters(
  surface: ListSurface,
): readonly ListFilterKey[] {
  return SURFACE_FILTERS[surface]
}

/** The sort keys a surface's control may offer, descending variants included. */
export function listSurfaceSortKeys(surface: ListSurface): readonly string[] {
  return SORT_KEYS[surface]
}

/** The status values a surface's control may offer — a project's, or a task's. */
export function listSurfaceStatuses(surface: ListSurface): readonly string[] {
  return STATUSES[surface]
}

export const EMPTY_LIST_QUERY_STATE: ListQueryState = {
  search: '',
  status: null,
  project: null,
  priority: null,
  assignee: null,
  risk: null,
  blocked: null,
  overBudget: null,
  critical: null,
  dueAfter: null,
  dueBefore: null,
  sort: null,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

function pick<T extends string>(
  value: string | null,
  allowed: readonly string[],
): T | null {
  return value !== null && allowed.includes(value) ? (value as T) : null
}

/** Only the two spellings the backend parses; everything else is "no opinion". */
function parseBoolean(value: string | null): boolean | null {
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * A calendar day, or nothing. The regex is not enough on its own — `2026-02-31`
 * matches it and is not a date — so the parsed value has to round-trip.
 */
function parseDate(value: string | null): string | null {
  if (value === null || !ISO_DATE.test(value)) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
    ? null
    : value
}

function parsePage(value: string | null): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1
}

/**
 * The page size, held inside what the server accepts. A hand-edited `999` is
 * clamped to `MAX_PAGE_SIZE` rather than refused: the intent ("as many as
 * possible") is legible, and forwarding it verbatim is a 422.
 */
function parsePageSize(value: string | null): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_PAGE_SIZE
  return Math.min(parsed, MAX_PAGE_SIZE)
}

/** Read the surface's list state out of a URL, degrading anything unusable. */
export function parseListQuery(
  params: URLSearchParams,
  surface: ListSurface,
): ListQueryState {
  const supported = SURFACE_FILTERS[surface]
  const read = (key: ListFilterKey): string | null =>
    supported.includes(key) ? params.get(LIST_PARAMS[key]) : null

  return {
    search: read('search')?.trim() ?? '',
    status: pick<ProjectStatus | TaskStatus>(read('status'), STATUSES[surface]),
    project: read('project') || null,
    priority: pick<TaskPriority>(read('priority'), PRIORITIES),
    assignee: read('assignee') || null,
    risk: read('risk') === AT_RISK_LENS ? AT_RISK_LENS : null,
    blocked: parseBoolean(read('blocked')),
    overBudget: parseBoolean(read('overBudget')),
    critical: parseBoolean(read('critical')),
    dueAfter: parseDate(read('dueAfter')),
    dueBefore: parseDate(read('dueBefore')),
    sort: pick<ProjectSortBy | TaskSortBy>(
      params.get(LIST_PARAMS.sort),
      SORT_KEYS[surface],
    ),
    page: parsePage(params.get(LIST_PARAMS.page)),
    pageSize: parsePageSize(params.get(LIST_PARAMS.pageSize)),
  }
}

/** The URL spelling of a value, or `null` when it is the default and stays unwritten. */
function serializeValue(
  state: ListQueryState,
  key: keyof ListQueryState,
): string | null {
  const value = state[key]
  if (value === null || value === '') return null
  if (key === 'page') return value === 1 ? null : String(value)
  if (key === 'pageSize')
    return value === DEFAULT_PAGE_SIZE ? null : String(value)
  return String(value)
}

/**
 * Write the state back into a query string.
 *
 * `base` carries the params this module does not own — `?tab=`, `?panel=` — so
 * writing a filter never drops the tab the user is on. Defaults are deleted,
 * not omitted: the same call has to be able to clear a filter that was there.
 */
export function serializeListQuery(
  state: ListQueryState,
  surface: ListSurface,
  base?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(base)
  const supported = SURFACE_FILTERS[surface]

  for (const key of Object.keys(LIST_PARAMS) as (keyof ListQueryState)[]) {
    const name = LIST_PARAMS[key]
    const isFilter = key !== 'sort' && key !== 'page' && key !== 'pageSize'
    const value =
      isFilter && !supported.includes(key) ? null : serializeValue(state, key)
    if (value === null) params.delete(name)
    else params.set(name, value)
  }

  return params
}

export interface ActiveListFilter {
  key: ListFilterKey
  /** The URL spelling — what a chip labels, and what identifies the value it removes. */
  value: string
}

/**
 * Which filters are on, in the order the vocabulary declares them.
 *
 * Shaped for the chip row: each entry names the single key to clear, so
 * removing one chip never has to reconstruct the rest of the state.
 */
export function activeListFilters(
  state: ListQueryState,
  surface: ListSurface,
): ActiveListFilter[] {
  return SURFACE_FILTERS[surface].flatMap((key) => {
    const value = serializeValue(state, key)
    return value === null ? [] : [{ key, value }]
  })
}
