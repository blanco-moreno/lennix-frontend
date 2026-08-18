import { Box, Flex } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/constants'

import { Button } from '../button'
import { Select } from '../select'
import { Text } from '../text'

import { paginationMessages } from './pagination-messages'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (next: number) => void
  /** Omit to hide the page-size selector and lock the size. */
  onPageSizeChange?: (next: number) => void
  pageSizeOptions?: readonly number[]
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const intl = useIntl()

  if (total === 0) return null

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <Flex flexWrap="wrap" align="center" justify="space-between" gap={4} py={3}>
      <Text size="sm" color="muted" whiteSpace="nowrap">
        <FormattedMessage
          {...paginationMessages.showingRange}
          values={{ first, last, total }}
        />
      </Text>
      <Flex flexWrap="wrap" align="center" gap={6}>
        {onPageSizeChange && (
          <Flex align="center" gap={2}>
            <Text
              as="label"
              htmlFor="pagination-page-size"
              size="sm"
              color="muted"
              whiteSpace="nowrap"
            >
              <FormattedMessage {...paginationMessages.perPage} />
            </Text>
            <Select
              value={String(pageSize)}
              onChange={(value) => onPageSizeChange(Number(value))}
              aria-label={intl.formatMessage(paginationMessages.perPage)}
              options={pageSizeOptions.map((size) => ({
                value: String(size),
                label: String(size),
              }))}
            />
          </Flex>
        )}
        <Flex align="center" gap={1}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={intl.formatMessage(paginationMessages.previousPage)}
          >
            <Box as={ChevronLeft} boxSize={4} />
          </Button>
          <Text
            size="sm"
            weight="medium"
            minW="12"
            align="center"
            whiteSpace="nowrap"
          >
            <FormattedMessage
              {...paginationMessages.pageOfTotal}
              values={{ page, totalPages: totalPages || 1 }}
            />
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label={intl.formatMessage(paginationMessages.nextPage)}
          >
            <Box as={ChevronRight} boxSize={4} />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}
