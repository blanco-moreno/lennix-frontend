/**
 * Borradores — the ONE home for drafts.
 *
 * The dashboard keeps a single nudge that deep-links here; the projects page is
 * live projects only; and this is where a draft is found, resumed, discarded —
 * with the plan's draft cap visible on the same screen.
 */

import { Box, Flex, Stack, chakra } from '@chakra-ui/react'
import { Plus, Trash2, FileEdit } from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import {
  Button,
  Checkbox,
  EmptyState,
  LoadingOverlay,
  ListPanel,
  ListToolbar,
  Text,
  RequirePermission,
  Pagination,
  ProjectTable,
} from '@/components'
import { Modal } from '@/components/ui/modal'
import { DEFAULT_PAGE_SIZE, PATHS } from '@/constants'
import { PlanLimitButton, PlanUsageMeter } from '@/features'
import { usePermission } from '@/hooks'
import { useIntlToast } from '@/i18n'
import { resolveProjectDestination } from '@/router'
import { useGetMeQuery } from '@/services/auth'
import {
  useBulkDeleteProjectsMutation,
  useListProjectsPaginatedQuery,
} from '@/services/project'

import { draftsViewMessages as m } from './drafts-view-messages'

export function DraftsView() {
  const intl = useIntl()
  const navigate = useNavigate()
  const toast = useIntlToast()

  // The view itself is `project.create`, which includes the manager — but
  // `POST /projects/bulk-delete` is `project.delete`, owner/admin only. Offering
  // the button to a manager is offering a 403, so the whole selection goes with
  // it: selecting rows there is nothing to do with.
  const canDelete = usePermission('project.delete')

  const { data: me } = useGetMeQuery()
  const organizationId = me?.organizationId ?? ''

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Drafts are their own query (`is_draft=true`) — never the live list filtered
  // client-side, which is how surfaces end up disagreeing with each other.
  const { data, isLoading, isFetching, error } = useListProjectsPaginatedQuery(
    { organizationId, page, pageSize, isDraft: true },
    { skip: !organizationId },
  )
  const [bulkDeleteProjects, { isLoading: isDeleting }] =
    useBulkDeleteProjectsMutation()

  const drafts = data?.items ?? []

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    setSelectedIds([])
  }

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize)
    setPage(1)
    setSelectedIds([])
  }

  const handleDelete = async () => {
    try {
      await bulkDeleteProjects(selectedIds).unwrap()
      toast.success(m.deleteSuccess, { count: selectedIds.length })
      setSelectedIds([])
    } catch {
      toast.error(m.deleteError)
    }
  }

  return (
    // Same view rhythm as /projects and /tasks: one padding scale, one gap.
    <Stack gap="block" px="gutter" py="gutterY" data-testid="drafts-view">
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        gap={4}
        align={{ sm: 'center' }}
        justify={{ sm: 'space-between' }}
      >
        <Text size="lg" color="muted">
          <FormattedMessage {...m.subtitle} />
        </Text>

        <RequirePermission permission="project.create">
          <PlanLimitButton
            resource="drafts"
            size="lg"
            onClick={async () => navigate(PATHS.PROJECT_IMPORT)}
          >
            <Box as={Plus} boxSize={5} mr={2} />
            <FormattedMessage {...m.importSchedule} />
          </PlanLimitButton>
        </RequirePermission>
      </Flex>

      <PlanUsageMeter resource="drafts" />

      {/* Every state keeps the card: the listing surface is the same piece
          whether it holds rows, a skeleton or a reason there are none. The
          bulk toolbar is what drops away — a "select all" over nothing and a
          delete button that can never fire are worse than absent. */}
      {isLoading ? (
        <ListPanel>
          <ProjectTable
            projects={[]}
            isLoading
            skeletonRows={4}
            ariaLabel={intl.formatMessage(m.title)}
            context="drafts"
            onRowClick={() => undefined}
          />
        </ListPanel>
      ) : error ? (
        <ListPanel>
          <EmptyState icon={FileEdit} title={intl.formatMessage(m.loadError)} />
        </ListPanel>
      ) : drafts.length === 0 ? (
        <ListPanel>
          <EmptyState
            icon={FileEdit}
            title={intl.formatMessage(m.emptyTitle)}
            description={intl.formatMessage(m.emptyDescription)}
          />
        </ListPanel>
      ) : (
        // One piece: the bulk controls, the paginator and the listing share
        // a single card — the same grammar as /projects.
        <ListPanel>
          <ListToolbar>
            {canDelete && (
              <Flex align="center" justify="space-between" gap={4} wrap="wrap">
                <Flex align="center" gap="tight">
                  <Checkbox
                    id="select-all-drafts"
                    data-testid="select-all-drafts"
                    aria-label={intl.formatMessage(m.selectAll)}
                    checked={
                      drafts.length > 0 && selectedIds.length === drafts.length
                    }
                    onCheckedChange={(checked) =>
                      setSelectedIds(
                        checked ? drafts.map((draft) => draft.id) : [],
                      )
                    }
                  />
                  <chakra.label
                    htmlFor="select-all-drafts"
                    cursor="pointer"
                    fontSize="md"
                    fontWeight="medium"
                    color="fg.default"
                    userSelect="none"
                  >
                    <FormattedMessage {...m.selectAll} />
                  </chakra.label>
                  {selectedIds.length > 0 && (
                    <Box
                      as="span"
                      rounded="full"
                      bg="primary/10"
                      px={2.5}
                      py={0.5}
                      fontSize="xs"
                      fontWeight="semibold"
                      color="primary"
                    >
                      <FormattedMessage
                        {...m.selectedCount}
                        values={{ count: selectedIds.length }}
                      />
                    </Box>
                  )}
                </Flex>
                <Button
                  variant="destructive"
                  size="sm"
                  gap={1.5}
                  disabled={selectedIds.length === 0 || isDeleting}
                  onClick={() => setConfirmOpen(true)}
                >
                  <Box as={Trash2} boxSize={4} />
                  <FormattedMessage {...m.deleteSelected} />
                </Button>
              </Flex>
            )}

            <Pagination
              page={page}
              pageSize={pageSize}
              total={data?.total ?? 0}
              totalPages={data?.totalPages ?? 0}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </ListToolbar>

          {/* The same listing `/projects` reads, so a draft and a live obra
              are one thing the user learns once. What differs is what the two
              per-listing tracks answer: station and age instead of avance and
              deadline. */}
          <LoadingOverlay busy={isFetching}>
            <ProjectTable
              projects={drafts}
              ariaLabel={intl.formatMessage(m.title)}
              context="drafts"
              rowTestId={() => 'draft-row'}
              // A draft opens its resumable review canvas, never project-detail.
              onRowClick={(draft) => {
                void navigate(
                  resolveProjectDestination({ ...draft, isDraft: true }),
                )
              }}
              selectedIds={canDelete ? selectedIds : undefined}
              onSelectedChange={
                canDelete
                  ? (id, checked) =>
                      setSelectedIds((previous) =>
                        checked
                          ? [...previous, id]
                          : previous.filter((current) => current !== id),
                      )
                  : undefined
              }
            />
          </LoadingOverlay>
        </ListPanel>
      )}

      <Modal
        variant="confirmation"
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={<FormattedMessage {...m.deleteDialogTitle} />}
        description={
          <FormattedMessage
            {...m.deleteDialogBody}
            values={{ count: selectedIds.length }}
          />
        }
        cancelLabel={<FormattedMessage {...m.deleteCancel} />}
        confirmLabel={<FormattedMessage {...m.deleteConfirm} />}
        onConfirm={handleDelete}
      />
    </Stack>
  )
}
