import { Flex, Stack } from '@chakra-ui/react'
import { FormattedMessage, useIntl } from 'react-intl'

import { FilterReset, Label, Select, Text, SearchInput } from '@/components'
import { useStatusLabel } from '@/hooks'

import { subtaskPanelMessages as m } from '../../subtask-panel-messages'

interface SubtaskFiltersProps {
  total: number
  filtered: number
  search: string
  onSearch: (value: string) => void
  status: string
  onStatus: (value: string) => void
  /** True while anything narrows the list — including `?subtask=`. */
  isActive: boolean
  onReset: () => void
}

/**
 * The subactivity filter bar — the same block /tasks uses, minus the project
 * picker (everything here already belongs to one activity). Reset clears the
 * text, the status and the `?subtask=` selection the URL may carry.
 */
export function SubtaskFilters({
  total,
  filtered,
  search,
  onSearch,
  status,
  onStatus,
  isActive,
  onReset,
}: SubtaskFiltersProps) {
  const intl = useIntl()
  const statusLabel = useStatusLabel()

  return (
    <Stack
      gap={4}
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border"
      rounded="xl"
      p={{ base: 4, lg: 5 }}
      data-testid="subtask-filters"
    >
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: 4, lg: 6 }}
        align={{ lg: 'flex-end' }}
      >
        <Stack flex={1} gap={2} maxW={{ lg: '2xl' }}>
          <Label color="fg.muted" fontSize="xs">
            <FormattedMessage {...m.subtaskFilterSearchLabel} />
          </Label>
          <SearchInput
            value={search}
            onChange={onSearch}
            placeholder={intl.formatMessage(m.subtaskFilterSearchPlaceholder)}
          />
        </Stack>

        <Stack w={{ base: 'full', lg: 56 }} gap={2}>
          <Label color="fg.muted" fontSize="xs">
            <FormattedMessage {...m.subtaskFilterStatusLabel} />
          </Label>
          <Select
            value={status}
            onChange={onStatus}
            placeholder={intl.formatMessage(m.subtaskFilterStatusLabel)}
            options={[
              {
                value: 'all',
                label: intl.formatMessage(m.subtaskFilterStatusAll),
              },
              { value: 'in_progress', label: statusLabel('in_progress') },
              { value: 'done', label: statusLabel('done') },
              { value: 'todo', label: statusLabel('todo') },
              { value: 'cancelled', label: statusLabel('cancelled') },
            ]}
          />
        </Stack>

        <FilterReset isActive={isActive} onReset={onReset} />
      </Flex>

      <Text
        size="sm"
        color="muted"
        borderTopWidth="1px"
        borderColor="border"
        pt={3}
      >
        <FormattedMessage
          {...m.subtaskFilterResults}
          values={{ filtered, total }}
        />
      </Text>
    </Stack>
  )
}
