import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import {
  activeListFilters,
  parseListQuery,
  serializeListQuery,
  type ListFilterKey,
  type ListQueryState,
  type ListSurface,
} from '@/router'

import { useDebouncedValue } from '../use-debounced-value'

/**
 * The filtered list's state, held in the URL.
 *
 * Two decisions this hook exists to enforce:
 *
 * **Any filter change resets the page, in the same write.** Filtering from page
 * 4 of a set that now has 2 pages leaves the user staring at an empty list. One
 * navigation carries both the filter and the reset, so no render ever sees the
 * new filter against the stale page.
 *
 * **The search box is immediate, the URL is debounced.** The input keeps its own
 * value so every keystroke shows, and only the settled term reaches the URL and
 * therefore the server — writing on each key would push a history entry per
 * letter and refetch per letter alike. `replace: true` for the same reason the
 * tasks and papelera views use it: Back should leave the list, not undo typing.
 */
export function useListQueryState(surface: ListSurface) {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(
    () => parseListQuery(searchParams, surface),
    [searchParams, surface],
  )

  const [searchInput, setSearchInput] = useState(state.search)
  const debouncedSearch = useDebouncedValue(searchInput)

  /**
   * Adopt a search term that arrived from outside — a pasted link, the Back
   * button, a KPI tile. A term this hook wrote itself already equals the
   * debounced input, and re-adopting it would rewind a user who kept typing
   * while the debounce was in flight.
   */
  const [lastUrlSearch, setLastUrlSearch] = useState(state.search)
  if (state.search !== lastUrlSearch) {
    setLastUrlSearch(state.search)
    if (state.search !== debouncedSearch) setSearchInput(state.search)
  }

  const write = useCallback(
    (patch: Partial<ListQueryState>, keepPage: boolean) => {
      setSearchParams(
        (previous) => {
          const current = parseListQuery(previous, surface)
          const next = { ...current, ...patch }
          return serializeListQuery(
            keepPage ? next : { ...next, page: 1 },
            surface,
            previous,
          )
        },
        { replace: true },
      )
    },
    [setSearchParams, surface],
  )

  useEffect(() => {
    if (debouncedSearch !== state.search)
      write({ search: debouncedSearch }, false)
  }, [debouncedSearch, state.search, write])

  const setFilter = useCallback(
    <K extends ListFilterKey>(key: K, value: ListQueryState[K]) => {
      if (key === 'search') setSearchInput(String(value ?? ''))
      write({ [key]: value } as Partial<ListQueryState>, false)
    },
    [write],
  )

  const clearFilters = useCallback(() => {
    setSearchInput('')
    write(
      {
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
      },
      false,
    )
  }, [write])

  /** Sorting reorders the whole set, so it starts the reading over at page 1. */
  const setSort = useCallback(
    (sort: ListQueryState['sort']) => write({ sort }, false),
    [write],
  )

  const setPage = useCallback((page: number) => write({ page }, true), [write])

  const setPageSize = useCallback(
    (pageSize: number) => write({ pageSize }, false),
    [write],
  )

  const activeFilters = useMemo(
    () => activeListFilters(state, surface),
    [state, surface],
  )

  return {
    state,
    /** The box's own value: immediate, unlike `state.search`. */
    searchInput,
    setSearchInput,
    setFilter,
    clearFilters,
    setSort,
    setPage,
    setPageSize,
    activeFilters,
    hasActiveFilters: activeFilters.length > 0,
  }
}
