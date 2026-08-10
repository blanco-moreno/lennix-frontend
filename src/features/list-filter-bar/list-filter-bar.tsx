import { Flex, Span, Stack } from '@chakra-ui/react'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Button,
  FilterChips,
  FilterReset,
  Label,
  SearchInput,
  Select,
  type FilterChip,
} from '@/components'
import type { useListQueryState } from '@/hooks'
import {
  AT_RISK_LENS,
  listSurfaceFilters,
  listSurfaceSortKeys,
  type ListFilterKey,
  type ListSurface,
} from '@/router'
import type {
  ProjectSortBy,
  ProjectStatus,
  TaskPriority,
  TaskSortBy,
  TaskStatus,
} from '@/types'

import { FilterControl } from './components/filter-control'
import { MemberFilterControl } from './components/member-filter-control'
import { ProjectFilterControl } from './components/project-filter-control'
import { FILTER_ALL, PRIMARY_FILTERS } from './constants'
import { useFilterVocabulary } from './hooks/use-filter-vocabulary'
import { listFilterBarMessages as m } from './list-filter-bar-messages'

/** The bar edits URL state; the hook that owns it is what it takes. */
type ListQueryControls = ReturnType<typeof useListQueryState>

/** Ids read as ids, so their chip names the filter and leaves the value to the picker. */
const OPAQUE_VALUE_FILTERS: readonly ListFilterKey[] = ['project', 'assignee']

interface ListFilterBarProps {
  surface: ListSurface
  query: ListQueryControls
  searchPlaceholder: string
}

/**
 * The filter bar of every server-queried listing.
 *
 * One component for `/projects` and `/tasks` on purpose. The two bars were
 * homologated by hand and drifted the moment either grew a control; here the
 * surface declares which filters its endpoint answers (`listSurfaceFilters`)
 * and the same control renders for the same field on both.
 *
 * Nothing here narrows anything: every value goes to the URL, from the URL to
 * the request, and the rows that come back are rendered as they arrive. A bar
 * that filtered the fetched page would disagree with the paginator beside it.
 */
export function ListFilterBar({
  surface,
  query,
  searchPlaceholder,
}: ListFilterBarProps) {
  const intl = useIntl()
  const vocabulary = useFilterVocabulary(surface)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { state, activeFilters, setFilter } = query
  const fields = listSurfaceFilters(surface)
  const secondary = fields.filter((field) => !PRIMARY_FILTERS.includes(field))

  /**
   * The URL spelling back into typed state. One place, because this is where
   * `'true'` becomes a boolean and a status stops being an arbitrary string —
   * every control speaks the URL's vocabulary and nothing more.
   */
  const applyValue = (field: ListFilterKey, value: string | null) => {
    switch (field) {
      case 'search':
        return setFilter('search', value ?? '')
      case 'status':
        return setFilter('status', value as ProjectStatus | TaskStatus | null)
      case 'priority':
        return setFilter('priority', value as TaskPriority | null)
      case 'risk':
        return setFilter('risk', value === null ? null : AT_RISK_LENS)
      case 'blocked':
      case 'overBudget':
      case 'critical':
        return setFilter(field, value === null ? null : value === 'true')
      default:
        return setFilter(field, value)
    }
  }

  const chips: FilterChip[] = activeFilters.map(({ key, value }) => ({
    key,
    label: OPAQUE_VALUE_FILTERS.includes(key)
      ? vocabulary.fieldLabel(key)
      : intl.formatMessage(m.chipValue, {
          field: vocabulary.fieldLabel(key),
          value: vocabulary.valueLabel(key, value),
        }),
  }))

  return (
    <Stack gap={4}>
      {/* Controls only — the enclosing ListToolbar card owns the panel and the
          paginator, so the bar carries no frame of its own. */}
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: 4, lg: 6 }}
        align={{ lg: 'flex-end' }}
        wrap="wrap"
      >
        <Stack flex={1} gap={2} minW={{ lg: 'xs' }}>
          <Label color="fg.muted" fontSize="xs">
            <FormattedMessage {...m.fieldSearch} />
          </Label>
          {/* The box shows every keystroke; only the settled term reaches the
              URL and therefore the server. */}
          <SearchInput
            value={query.searchInput}
            onChange={query.setSearchInput}
            placeholder={searchPlaceholder}
          />
        </Stack>

        {/* On a phone the whole office panel hides behind the toggle: a jefe de
            obra opens the list to read today's activities, not to sort them.
            From `lg` the group dissolves into a single row. */}
        <Stack
          display={{
            base: showAdvanced ? 'flex' : 'none',
            md: 'flex',
            lg: 'contents',
          }}
          gap={4}
        >
          {fields.includes('status') && (
            <FilterControl
              field="status"
              state={state}
              vocabulary={vocabulary}
              onChange={applyValue}
            />
          )}

          {fields.includes('project') && (
            <ProjectFilterControl
              value={state.project}
              onChange={(projectId) => applyValue('project', projectId)}
            />
          )}

          <Stack w={{ base: 'full', lg: 56 }} gap={2}>
            <Label color="fg.muted" fontSize="xs">
              <FormattedMessage {...m.fieldSort} />
            </Label>
            {/* Sorting is the server's: reordering the five rows that arrived
                would rank the page, not the set. */}
            <Select
              value={state.sort ?? FILTER_ALL}
              onChange={(value) =>
                query.setSort(
                  value === FILTER_ALL
                    ? null
                    : (value as ProjectSortBy | TaskSortBy),
                )
              }
              placeholder={intl.formatMessage(m.fieldSort)}
              options={vocabulary.sortOptions(listSurfaceSortKeys(surface))}
            />
          </Stack>
        </Stack>

        <Button
          type="button"
          size="sm"
          variant="outline"
          alignSelf={{ base: 'flex-start', lg: 'flex-end' }}
          aria-expanded={showAdvanced}
          onClick={() => setShowAdvanced((open) => !open)}
          {...(secondary.length === 0 && { hideFrom: 'md' })}
        >
          <SlidersHorizontal size={16} />
          <Span hideFrom="md">
            <FormattedMessage
              {...m.filtersCount}
              values={{ count: activeFilters.length }}
            />
          </Span>
          <Span hideBelow="md">
            <FormattedMessage
              {...(showAdvanced ? m.fewerFilters : m.moreFilters)}
            />
          </Span>
        </Button>
      </Flex>

      {showAdvanced && secondary.length > 0 && (
        <Flex
          role="group"
          aria-label={intl.formatMessage(m.advancedFilters)}
          direction={{ base: 'column', lg: 'row' }}
          gap={{ base: 4, lg: 6 }}
          wrap="wrap"
        >
          {secondary.map((field) =>
            field === 'assignee' ? (
              <MemberFilterControl
                key={field}
                label={vocabulary.fieldLabel('assignee')}
                value={state.assignee}
                onChange={(userId) => applyValue('assignee', userId)}
              />
            ) : (
              <FilterControl
                key={field}
                field={field}
                state={state}
                vocabulary={vocabulary}
                onChange={applyValue}
              />
            ),
          )}
        </Flex>
      )}

      {/* What is on right now, and one click to drop any one of them — with
          the coarse version of the same idea beside it. Both stay out of the
          collapsing panel: a phone that hides the controls must still be able
          to see, and undo, what is filtering the list. */}
      <Flex align="center" justify="space-between" gap="tight" wrap="wrap">
        <FilterChips
          chips={chips}
          onRemove={(key) => applyValue(key as ListFilterKey, null)}
        />
        <FilterReset
          isActive={query.hasActiveFilters}
          onReset={query.clearFilters}
        />
      </Flex>
    </Stack>
  )
}
