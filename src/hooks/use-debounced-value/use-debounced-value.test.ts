import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from './use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value straight away', () => {
    const { result } = renderHook(() => useDebouncedValue('bodega'))

    expect(result.current).toBe('bodega')
  })

  it('holds a new value back until the delay has passed', () => {
    const { result, rerender } = renderHook(
      ({ term }) => useDebouncedValue(term),
      { initialProps: { term: '' } },
    )

    rerender({ term: 'bod' })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    })
    expect(result.current).toBe('bod')
  })

  it('collapses a typed word into one value', () => {
    const { result, rerender } = renderHook(
      ({ term }) => useDebouncedValue(term),
      { initialProps: { term: '' } },
    )

    // Six keystrokes, none of them a full delay apart — the whole point of the
    // hook is that this is one request, not six.
    for (const term of ['b', 'bo', 'bod', 'bode', 'bodeg', 'bodega']) {
      rerender({ term })
      act(() => {
        vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 100)
      })
      expect(result.current).toBe('')
    }

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    })
    expect(result.current).toBe('bodega')
  })

  it('honours an explicit delay', () => {
    const { result, rerender } = renderHook(
      ({ term }) => useDebouncedValue(term, 1000),
      { initialProps: { term: '' } },
    )

    rerender({ term: 'torre' })
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toBe('torre')
  })
})
