/**
 * The paginated envelope every list endpoint returns — mirrors
 * `app.shared.pagination.Page` in `lennix-ms-bk`, snake_case as it arrives
 * on the wire. The camelCase domain twin is `Page<T>` in `@/types/pagination`.
 */
export interface PageDTO<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
