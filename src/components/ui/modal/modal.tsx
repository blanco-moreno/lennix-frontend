import { Dialog as ChakraDialog, Portal } from '@chakra-ui/react'
import { type LucideIcon } from 'lucide-react'
import * as React from 'react'

import { Button, type ButtonProps } from '../button'

import { ModalCloseButton } from './components/modal-close-button'
import { ModalHeader } from './components/modal-header'

// The single dialog component for the whole app, built directly on Chakra's
// `Dialog.*` compound. Two variants:
//   • "classic"      — a flexible shell for form/content modals: header + body
//     (children) + an optional custom `footer`. Pass `onSubmit` to wrap the
//     content in a <form> (e.g. a React Hook Form modal).
//   • "confirmation" — a declarative confirm/delete prompt (title, description,
//     cancel + confirm buttons).

type ModalSize = 'sm' | 'md' | 'lg'

const nativeSizeFor: Record<ModalSize, 'md' | 'lg' | 'xl'> = {
  sm: 'md',
  md: 'lg',
  lg: 'xl',
}

/**
 * Every size caps at the viewport before it caps at its own width. A `md`
 * dialog is 768px and a tablet in portrait is 768px, so the fixed cap made an
 * ordinary dialog bleed to the edges without ever deciding to be fullscreen.
 */
const maxWFor: Record<ModalSize, Record<string, string>> = {
  sm: { base: 'calc(100vw - 2rem)', md: 'xl' }, // 576px
  md: { base: 'calc(100vw - 2rem)', lg: '4xl' }, // 768px
  lg: { base: 'calc(100vw - 2rem)', xl: '6xl' }, // 1024px
}

type CommonModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  size?: ModalSize
  /** Optional leading icon rendered next to the title. */
  icon?: LucideIcon
  iconColor?: string
}

type ClassicModalProps = CommonModalProps & {
  variant?: 'classic'
  children?: React.ReactNode
  footer?: React.ReactNode
  /** When provided, header/body/footer are wrapped in a <form>. */
  onSubmit?: React.FormEventHandler<HTMLFormElement>
  /** Scroll the body instead of the page when the modal is tall. */
  scrollBehavior?: 'inside' | 'outside'
  contentProps?: ChakraDialog.ContentProps
}

type ConfirmationModalProps = CommonModalProps & {
  variant: 'confirmation'
  /** Optional extra body content above the action buttons. */
  children?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  onConfirm: () => void
  confirmVariant?: ButtonProps['variant']
  isConfirming?: boolean
  confirmDisabled?: boolean
}

type ModalProps = ClassicModalProps | ConfirmationModalProps

function Modal(props: ModalProps) {
  const { open, onOpenChange, title, description, icon, iconColor } = props

  if (props.variant === 'confirmation') {
    const {
      size = 'sm',
      children,
      confirmLabel = 'Confirmar',
      cancelLabel = 'Cancelar',
      onConfirm,
      confirmVariant = 'destructive',
      isConfirming = false,
      confirmDisabled = false,
    } = props
    return (
      <ChakraDialog.Root
        placement="center"
        size={nativeSizeFor[size]}
        open={open}
        onOpenChange={(e) => onOpenChange(e.open)}
      >
        <Portal>
          <ChakraDialog.Backdrop />
          <ChakraDialog.Positioner>
            <ChakraDialog.Content colorPalette="brand" maxW={maxWFor[size]}>
              <ModalCloseButton />
              <ModalHeader
                title={title}
                description={description}
                icon={icon}
                iconColor={iconColor}
              />
              {children && <ChakraDialog.Body>{children}</ChakraDialog.Body>}
              <ChakraDialog.Footer>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isConfirming}
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant={confirmVariant}
                  onClick={() => {
                    onConfirm()
                    onOpenChange(false)
                  }}
                  disabled={isConfirming || confirmDisabled}
                >
                  {confirmLabel}
                </Button>
              </ChakraDialog.Footer>
            </ChakraDialog.Content>
          </ChakraDialog.Positioner>
        </Portal>
      </ChakraDialog.Root>
    )
  }

  const {
    size = 'md',
    children,
    footer,
    onSubmit,
    scrollBehavior,
    contentProps,
  } = props
  const body = (
    <>
      <ModalHeader
        title={title}
        description={description}
        icon={icon}
        iconColor={iconColor}
      />
      {children && <ChakraDialog.Body>{children}</ChakraDialog.Body>}
      {footer && <ChakraDialog.Footer>{footer}</ChakraDialog.Footer>}
    </>
  )

  return (
    <ChakraDialog.Root
      placement="center"
      size={nativeSizeFor[size]}
      scrollBehavior={scrollBehavior}
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
    >
      <Portal>
        <ChakraDialog.Backdrop />
        <ChakraDialog.Positioner>
          <ChakraDialog.Content
            colorPalette="brand"
            maxW={maxWFor[size]}
            {...contentProps}
          >
            <ModalCloseButton />
            {onSubmit ? <form onSubmit={onSubmit}>{body}</form> : body}
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  )
}

export { Modal }
export type { CommonModalProps, ModalSize }
