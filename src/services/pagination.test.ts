import { describe, expect, it } from 'vitest'

import type { PageDTO } from '@/types/dto/pagination-dto'

import { mapPage } from './pagination'

describe('mapPage', () => {
  const dto: PageDTO<{ value: number }> = {
    items: [{ value: 1 }, { value: 2 }],
    total: 7,
    page: 2,
    page_size: 2,
    total_pages: 4,
  }

  it('maps the envelope snake→camel and each item through the item mapper', () => {
    const page = mapPage(dto, (item) => item.value * 10)
    expect(page).toEqual({
      items: [10, 20],
      total: 7,
      page: 2,
      pageSize: 2,
      totalPages: 4,
    })
  })

  it('keeps an empty page empty', () => {
    const empty: PageDTO<never> = {
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    }
    expect(mapPage(empty, (item) => item).items).toEqual([])
  })
})
