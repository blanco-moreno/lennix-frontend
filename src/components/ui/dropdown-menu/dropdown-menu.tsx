import { Icon, Menu as ChakraMenu, Portal } from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'
import * as React from 'react'

export interface DropdownMenuItemSpec {
  type?: 'item' | 'separator'
  label?: React.ReactNode
  icon?: LucideIcon
  onSelect?: () => void
  disabled?: boolean
  itemProps?: Omit<ChakraMenu.ItemProps, 'value' | 'children' | 'onSelect'>
}

type MenuPlacement = NonNullable<
  ChakraMenu.RootProps['positioning']
>['placement']

export interface DropdownMenuProps {
  trigger: React.ReactElement
  items: DropdownMenuItemSpec[]
  align?: 'start' | 'center' | 'end'
  placement?: MenuPlacement
  sideOffset?: number
  contentProps?: Omit<ChakraMenu.ContentProps, 'children'>
  onOpenChange?: (open: boolean) => void
}

const placementFor = (align: DropdownMenuProps['align']): MenuPlacement =>
  align === 'end'
    ? 'bottom-end'
    : align === 'center'
      ? 'bottom'
      : 'bottom-start'

function DropdownMenu({
  trigger,
  items,
  align,
  placement,
  sideOffset = 4,
  contentProps,
  onOpenChange,
}: DropdownMenuProps) {
  return (
    <ChakraMenu.Root
      positioning={{
        placement: placement ?? placementFor(align),
        gutter: sideOffset,
      }}
      onOpenChange={onOpenChange ? (e) => onOpenChange(e.open) : undefined}
    >
      <ChakraMenu.Trigger asChild>{trigger}</ChakraMenu.Trigger>
      <Portal>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content colorPalette="brand" {...contentProps}>
            {items.map((item, index) =>
              item.type === 'separator' ? (
                <ChakraMenu.Separator key={`separator-${index}`} />
              ) : (
                <ChakraMenu.Item
                  key={String(index)}
                  value={String(index)}
                  disabled={item.disabled}
                  onSelect={item.onSelect}
                  {...item.itemProps}
                >
                  {item.icon && <Icon as={item.icon} boxSize={4} mr={2} />}
                  {item.label}
                </ChakraMenu.Item>
              ),
            )}
          </ChakraMenu.Content>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>
  )
}

export { DropdownMenu }
