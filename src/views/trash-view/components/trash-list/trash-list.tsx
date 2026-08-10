import { Box, Flex, HStack } from '@chakra-ui/react'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Button,
  EmptyState,
  ListPanel,
  ListToolbar,
  ListRowSkeleton,
  Pagination,
} from '@/components'
import { Modal } from '@/components/ui/modal'
import { useBulkPurgeTrashedMutation } from '@/services/trash'
import type { Page, TrashKind } from '@/types'

import { TRASH_GRID_COLUMNS } from '../../trash-grid'
import { trashMessages as m } from '../../trash-view-messages'
import { TrashListHeader } from '../trash-list-header'
import { TrashListRow } from '../trash-list-row'

/** One row of any papelera tab, already reduced to what the list renders. */
export interface TrashRow {
  id: string
  primary: string
  secondary?: string
  deletedAt: string | null
}

interface TrashListProps {
  kind: TrashKind
  rows: TrashRow[]
  isLoading: boolean
  onRestore: (id: string) => Promise<void>
  onPurge: (id: string) => void
  canPurge: boolean
  /** The envelope, so the paginator reports the server's totals. */
  pageInfo?: Page<unknown>
  onPageChange: (next: number) => void
}

export function TrashList({
  kind,
  rows,
  isLoading,
  onRestore,
  onPurge,
  canPurge,
  pageInfo,
  onPageChange,
}: TrashListProps) {
  const intl = useIntl()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkPurge, { isLoading: isBulkPurging }] =
    useBulkPurgeTrashedMutation()
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)

  // Only ever act on rows that are still here: a restored row's id lingers in
  // `selectedIds`, and purging it would be refused by the backend.
  const liveSelection = selectedIds.filter((id) =>
    rows.some((row) => row.id === id),
  )
  const allSelected = rows.length > 0 && liveSelection.length === rows.length

  // Both states keep the panel: a listing that empties out should not take
  // its own card with it and leave the tab looking unfinished.
  if (isLoading) {
    return (
      <ListPanel>
        <Box
          role="presentation"
          aria-busy
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          bg="bg.panel"
        >
          <TrashListHeader />
          <ListRowSkeleton templateColumns={TRASH_GRID_COLUMNS} count={3} />
        </Box>
      </ListPanel>
    )
  }
  if (rows.length === 0) {
    return (
      <ListPanel>
        <EmptyState
          icon={Trash2}
          title={intl.formatMessage(m.emptyTitle)}
          description={intl.formatMessage(m.emptyBody)}
        />
      </ListPanel>
    )
  }

  const handleSelectAll = () => {
    setSelectedIds(rows.map((r) => r.id))
  }

  const handleDeselectAll = () => {
    setSelectedIds([])
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleBulkPurge = async () => {
    try {
      await bulkPurge({ kind, ids: liveSelection }).unwrap()
      toast.success(intl.formatMessage(m.bulkPurgeSuccess), {
        id: m.bulkPurgeSuccess.id,
      })
      setSelectedIds([])
      setShowBulkConfirm(false)
    } catch {
      toast.error(intl.formatMessage(m.bulkPurgeError), {
        id: m.bulkPurgeError.id,
      })
    }
  }

  return (
    // One piece: the bulk controls, the paginator and the listing share a
    // single card — the same grammar as /projects.
    <ListPanel>
      <ListToolbar>
        <Flex
          flexWrap="wrap"
          align="center"
          justify="space-between"
          wrap="wrap"
          gap="tight"
        >
          <HStack gap={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={allSelected ? handleDeselectAll : handleSelectAll}
            >
              {allSelected
                ? intl.formatMessage(m.deselectAll)
                : intl.formatMessage(m.selectAll)}
            </Button>
            {liveSelection.length > 0 && (
              <Box as="span" fontSize="sm" fontWeight="medium" color="fg.muted">
                {intl.formatMessage(m.selectedCount, {
                  count: liveSelection.length,
                })}
              </Box>
            )}
          </HStack>
          {canPurge && liveSelection.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowBulkConfirm(true)}
              disabled={isBulkPurging}
            >
              <Box as={Trash2} boxSize={4} mr={1} />
              {intl.formatMessage(m.deleteSelected)}
            </Button>
          )}
        </Flex>

        {pageInfo && (
          <Pagination
            page={pageInfo.page}
            pageSize={pageInfo.pageSize}
            total={pageInfo.total}
            totalPages={pageInfo.totalPages}
            onPageChange={onPageChange}
          />
        )}
      </ListToolbar>

      {/* One record per row under one header — the same table grammar as
          every other listing, instead of a stack of cards. */}
      <Box
        role="table"
        aria-label={intl.formatMessage(m.pageTitle)}
        borderWidth="1px"
        borderColor="border"
        borderRadius="lg"
        bg="bg.panel"
      >
        <TrashListHeader />
        {rows.map((row) => (
          <TrashListRow
            key={row.id}
            row={row}
            selected={liveSelection.includes(row.id)}
            onSelectedChange={() => handleToggleSelect(row.id)}
            onRestore={async () => onRestore(row.id)}
            onPurge={canPurge ? () => onPurge(row.id) : undefined}
          />
        ))}
      </Box>

      <Modal
        variant="confirmation"
        open={showBulkConfirm}
        onOpenChange={setShowBulkConfirm}
        title={<FormattedMessage {...m.bulkPurgeConfirmTitle} />}
        description={<FormattedMessage {...m.bulkPurgeConfirmBody} />}
        cancelLabel={<FormattedMessage {...m.cancel} />}
        confirmLabel={<FormattedMessage {...m.purgeButton} />}
        onConfirm={handleBulkPurge}
      />
    </ListPanel>
  )
}
