import { useState } from 'react'

import { useGetMeQuery } from '@/services/auth'
import {
  PROJECT_SEARCH_PAGE_SIZE,
  useListProjectsPaginatedQuery,
} from '@/services/project'
import type { SelectOption } from '@/theme/recipes/select.recipe'

export interface ProjectSearch {
  /** The page the server returned for the current term, as combobox options. */
  options: SelectOption[]
  /** A search is in flight — hand it straight to `Combobox.isLoading`. */
  isLoading: boolean
  /** Hand straight to `Combobox.onSearch`; the box debounces before calling it. */
  onSearch: (term: string) => void
  /**
   * The organization has no projects at all — as opposed to none matching what
   * was typed. The difference is what lets a form say "create a project first"
   * without saying it to someone whose search simply missed.
   */
  isOrganizationEmpty: boolean
}

/**
 * The search behind every project dropdown. The term goes to the server —
 * client-side filtering of a single fetched page hides projects past the page boundary.
 */
export function useProjectSearch(): ProjectSearch {
  const { data: me } = useGetMeQuery()
  const organizationId = me?.organizationId ?? ''

  const [search, setSearch] = useState('')

  const { data, isFetching } = useListProjectsPaginatedQuery(
    {
      organizationId,
      page: 1,
      pageSize: PROJECT_SEARCH_PAGE_SIZE,
      search,
      sortBy: 'name',
    },
    { skip: !organizationId },
  )

  return {
    options: (data?.items ?? []).map((project) => ({
      value: project.id,
      label: project.name,
    })),
    // `isFetching`, not `isLoading`: a second search over a cached first page
    // is still a request the box should show as one.
    isLoading: isFetching,
    onSearch: setSearch,
    isOrganizationEmpty: !isFetching && !search && (data?.total ?? 0) === 0,
  }
}
