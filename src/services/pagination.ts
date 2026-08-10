import type { Page } from '@/types'
import type { PageDTO } from '@/types/dto/pagination-dto'

/**
 * Unwraps the backend's `Page` envelope once, for every list endpoint: the
 * envelope fields go snake→camel and each item goes through the module's own
 * item mapper. Mappers must not restate this shape inline.
 */
export function mapPage<T, U>(
  dto: PageDTO<T>,
  mapItem: (item: T) => U,
): Page<U> {
  return {
    items: dto.items.map(mapItem),
    total: dto.total,
    page: dto.page,
    pageSize: dto.page_size,
    totalPages: dto.total_pages,
  }
}
