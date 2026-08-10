import { Stack } from '@chakra-ui/react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'
import { useSearchParams } from 'react-router'

import { Tabs, Text } from '@/components'
import { Modal } from '@/components/ui/modal'
import { usePermission } from '@/hooks'
import {
  TRASH_PAGE_PARAM,
  TRASH_TAB_PARAM,
  resolveTrashPage,
  resolveTrashTab,
} from '@/router'
import { usePurgeTrashedMutation } from '@/services/trash'
import type { TrashKind } from '@/types'

import { ExpensesTab } from './components/expenses-tab'
import { ProjectsTab } from './components/projects-tab'
import { TasksTab } from './components/tasks-tab'
import { trashMessages as m } from './trash-view-messages'

export function TrashView() {
  const intl = useIntl()
  const [searchParams, setSearchParams] = useSearchParams()
  const canPurge = usePermission('trash.purge')

  // The open tab and the page both live in the URL: a papelera page is a link,
  // and "the third page of trashed subactivities" is a real place to send
  // somebody.
  const activeTab = resolveTrashTab(searchParams.get(TRASH_TAB_PARAM))
  const page = resolveTrashPage(searchParams.get(TRASH_PAGE_PARAM))

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set(TRASH_TAB_PARAM, value)
    // Page 3 of projects says nothing about expenses, so switching tabs starts
    // over rather than landing on a page that may not exist.
    next.delete(TRASH_PAGE_PARAM)
    setSearchParams(next, { replace: true })
  }

  const handlePageChange = (next: number) => {
    const params = new URLSearchParams(searchParams)
    if (next <= 1) params.delete(TRASH_PAGE_PARAM)
    else params.set(TRASH_PAGE_PARAM, String(next))
    setSearchParams(params, { replace: true })
  }
  const [purge] = usePurgeTrashedMutation()
  const [purgeTarget, setPurgeTarget] = useState<{
    kind: TrashKind
    id: string
  } | null>(null)

  const confirmPurge = async () => {
    if (!purgeTarget) return
    try {
      await purge(purgeTarget).unwrap()
      toast.success(intl.formatMessage(m.purgeSuccess), {
        id: m.purgeSuccess.id,
      })
    } catch {
      toast.error(intl.formatMessage(m.purgeError), { id: m.purgeError.id })
    } finally {
      setPurgeTarget(null)
    }
  }

  return (
    // Same view rhythm as /projects and /tasks: one padding scale, one gap.
    <Stack gap="block" px="gutter" py="gutterY">
      <Text size="lg" color="muted">
        <FormattedMessage {...m.pageSubtitle} />
      </Text>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        w="full"
        items={[
          {
            value: 'projects',
            label: <FormattedMessage {...m.tabProjects} />,
            content: (
              <ProjectsTab
                canPurge={canPurge}
                page={page}
                onPageChange={handlePageChange}
                onPurge={(id) => setPurgeTarget({ kind: 'project', id })}
              />
            ),
          },
          {
            value: 'tasks',
            label: <FormattedMessage {...m.tabTasks} />,
            content: (
              <TasksTab
                canPurge={canPurge}
                page={page}
                onPageChange={handlePageChange}
                onPurge={(id) => setPurgeTarget({ kind: 'task', id })}
              />
            ),
          },
          {
            value: 'expenses',
            label: <FormattedMessage {...m.tabExpenses} />,
            content: (
              <ExpensesTab
                canPurge={canPurge}
                page={page}
                onPageChange={handlePageChange}
                onPurge={(id) => setPurgeTarget({ kind: 'expense', id })}
              />
            ),
          },
        ]}
      />

      <Modal
        variant="confirmation"
        open={purgeTarget !== null}
        onOpenChange={(next) => {
          if (!next) setPurgeTarget(null)
        }}
        title={<FormattedMessage {...m.purgeConfirmTitle} />}
        description={<FormattedMessage {...m.purgeConfirmBody} />}
        cancelLabel={<FormattedMessage {...m.cancel} />}
        confirmLabel={<FormattedMessage {...m.purgeButton} />}
        onConfirm={confirmPurge}
      />
    </Stack>
  )
}
