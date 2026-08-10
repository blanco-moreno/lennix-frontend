import { useState } from 'react'
import { FormattedMessage } from 'react-intl'

import { Button } from '@/components'
import { Modal } from '@/components/ui/modal'

import { taskDetailViewMessages } from '../../../../task-detail-view-messages'
import { taskExpensesTabMessages as m } from '../../task-expenses-tab-messages'

// Trigger button + confirmation Modal for deleting an expense. Extracted so
// each row owns its own open state (the confirmation Modal is controlled and
// has no built-in trigger).
export function DeleteExpenseButton({
  isDeleting,
  name,
  onConfirm,
}: {
  isDeleting: boolean
  name: string
  onConfirm: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        disabled={isDeleting}
        onClick={() => setOpen(true)}
      >
        <FormattedMessage
          {...(isDeleting ? m.deleting : taskDetailViewMessages.deleteAction)}
        />
      </Button>
      <Modal
        variant="confirmation"
        open={open}
        onOpenChange={setOpen}
        title={<FormattedMessage {...m.expensesDeleteDialogTitle} />}
        description={
          <FormattedMessage
            {...m.expensesDeleteDialogDescription}
            values={{ name }}
          />
        }
        cancelLabel={<FormattedMessage {...taskDetailViewMessages.cancel} />}
        confirmLabel={
          <FormattedMessage {...taskDetailViewMessages.deleteAction} />
        }
        onConfirm={onConfirm}
      />
    </>
  )
}
