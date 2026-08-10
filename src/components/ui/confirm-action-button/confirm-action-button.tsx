import { Box } from '@chakra-ui/react'
import { Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '../button'
import { Modal } from '../modal'

interface ConfirmActionButtonProps {
  title: ReactNode
  description: ReactNode
  cancelLabel: ReactNode
  confirmLabel: ReactNode
  onConfirm: () => void
  disabled?: boolean
}

// Trigger button + confirmation Modal for a destructive row action. Extracted
// so each row owns its own open state (the confirmation Modal is controlled
// and has no built-in trigger).
export function ConfirmActionButton({
  title,
  description,
  cancelLabel,
  confirmLabel,
  onConfirm,
  disabled = false,
}: ConfirmActionButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Box as={Trash2} boxSize={3} />
      </Button>
      <Modal
        variant="confirmation"
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
      />
    </>
  )
}
