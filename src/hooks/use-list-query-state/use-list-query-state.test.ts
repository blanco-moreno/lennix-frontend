import { act, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { MemoryRouter, useSearchParams } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_PAGE_SIZE } from '@/constants'

import { SEARCH_DEBOUNCE_MS } from '../use-debounced-value'

import { useListQueryState } from './use-list-query-state'

function renderListQueryState(initialUrl = '/tasks') {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(MemoryRouter, { initialEntries: [initialUrl] }, children)

  return renderHook(
    () => ({
      list: useListQueryState('tasks'),
      params: useSearchParams()[0],
    }),
    { wrapper },
  )
}

describe('useListQueryState', () => {
  it('opens unfiltered on page 1 with the default page size', () => {
    const { result } = renderListQueryState()

    expect(result.current.list.state.page).toBe(1)
    expect(result.current.list.state.pageSize).toBe(DEFAULT_PAGE_SIZE)
    expect(result.current.list.hasActiveFilters).toBe(false)
  })

  it('reads the filters out of the URL it was opened on', () => {
    const { result } = renderListQueryState('/tasks?blocked=true&page=2')

    expect(result.current.list.state.blocked).toBe(true)
    expect(result.current.list.state.page).toBe(2)
    expect(result.current.list.activeFilters).toEqual([
      { key: 'blocked', value: 'true' },
    ])
  })

  it('resets to page 1 when a filter changes', () => {
    const { result } = renderListQueryState('/tasks?page=4')

    act(() => result.current.list.setFilter('priority', 'high'))

    expect(result.current.list.state.page).toBe(1)
    expect(result.current.params.get('page')).toBeNull()
    expect(result.current.params.get('priority')).toBe('high')
  })

  it('resets to page 1 when the page size changes', () => {
    const { result } = renderListQueryState('/tasks?page=4')

    act(() => result.current.list.setPageSize(20))

    expect(result.current.list.state.page).toBe(1)
    expect(result.current.list.state.pageSize).toBe(20)
  })

  it('keeps the filters when only the page moves', () => {
    const { result } = renderListQueryState('/tasks?priority=high')

    act(() => result.current.list.setPage(3))

    expect(result.current.list.state.page).toBe(3)
    expect(result.current.list.state.priority).toBe('high')
  })

  it('keeps params it does not own, like the open tab', () => {
    const { result } = renderListQueryState('/tasks?tab=list')

    act(() => result.current.list.setFilter('blocked', true))

    expect(result.current.params.get('tab')).toBe('list')
  })

  it('clears every filter but not the sort or the page size', () => {
    const { result } = renderListQueryState(
      '/tasks?priority=high&blocked=true&sort=title&page_size=20',
    )

    act(() => result.current.list.clearFilters())

    expect(result.current.list.hasActiveFilters).toBe(false)
    expect(result.current.list.state.sort).toBe('title')
    expect(result.current.list.state.pageSize).toBe(20)
  })

  it('shows a keystroke immediately and writes the settled term to the URL', () => {
    vi.useFakeTimers()
    try {
      const { result } = renderListQueryState('/tasks?page=3')

      act(() => result.current.list.setSearchInput('sla'))
      expect(result.current.list.searchInput).toBe('sla')
      expect(result.current.params.get('search')).toBeNull()

      act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS))

      expect(result.current.params.get('search')).toBe('sla')
      expect(result.current.list.state.search).toBe('sla')
      expect(result.current.list.state.page).toBe(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('adopts a search term that arrived from the URL', () => {
    const { result } = renderListQueryState('/tasks?search=slab')

    expect(result.current.list.searchInput).toBe('slab')
  })
})
