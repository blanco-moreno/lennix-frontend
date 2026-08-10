import type { PageDTO } from '@/types/dto/pagination-dto'

/** Wraps rows in the backend's `Page` envelope, the way one full page reads. */
export function pageOf<T>(items: T[]): PageDTO<T> {
  return {
    items,
    total: items.length,
    page: 1,
    page_size: 20,
    total_pages: 1,
  }
}
