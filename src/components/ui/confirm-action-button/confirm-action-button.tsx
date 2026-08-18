import { Box } from '@chakra-ui/react'
import { Trash2, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button, type ButtonProps } from '../button'
import { Modal } from '../modal'

interface ConfirmActionButtonProps {
  title: ReactNode
  description: ReactNode
  cancelLabel: ReactNode
  confirmLabel: ReactNode
  onConfirm: () => void
  disabled?: boolean
  /** Defaults to the destructive trash button; pass both for any other row action. */
  icon?: LucideIcon
  variant?: ButtonProps['variant']
  'aria-label'?: string
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
  icon = Trash2,
  variant = 'destructive',
  'aria-label': ariaLabel,
}: ConfirmActionButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant={variant}
        size="sm"
        disabled={disabled}
        // Icon-only: the confirmation's title is the action's name unless
        // the caller says otherwise.
        aria-label={
          ariaLabel ?? (typeof title === 'string' ? title : undefined)
        }
        onClick={() => setOpen(true)}
      >
        <Box as={icon} boxSize={3} />
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
