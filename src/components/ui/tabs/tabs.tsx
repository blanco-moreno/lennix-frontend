import { Tabs as ChakraTabs } from '@chakra-ui/react'
import * as React from 'react'

/**
 * The section-nav look: pills that wrap, not an underlined strip that scrolls.
 * Defined once here because the activity page and the project page are the
 * same navigation problem — one surface, several sections. Active state comes
 * from `_selected`, which Chakra sets on the active trigger.
 *
 * Applied to every `Tabs` by default; a consumer can still override either
 * through `listProps` or an item's `triggerProps`.
 */
const pillTabTriggerProps = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1.5,
  px: 3,
  py: 1.5,
  rounded: 'full',
  fontSize: 'xs',
  fontWeight: 'medium',
  borderWidth: '1px',
  borderColor: 'border',
  color: 'fg.muted',
  _selected: {
    borderColor: 'complementary',
    bg: 'complementary/10',
    color: 'complementary',
  },
} as const

/** Wraps to a second line rather than overflowing — a phone holds two pills. */
const pillTabListProps = { gap: 2, rowGap: 2, flexWrap: 'wrap' } as const

export interface TabItem {
  value: string
  label: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
  triggerProps?: Omit<ChakraTabs.TriggerProps, 'value' | 'children'>
  contentProps?: Omit<ChakraTabs.ContentProps, 'value' | 'children'>
}

export interface TabsProps extends Omit<
  ChakraTabs.RootProps,
  'value' | 'defaultValue' | 'onValueChange' | 'children'
> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  items: TabItem[]
  listProps?: ChakraTabs.ListProps
}

function Tabs({
  value,
  defaultValue,
  onValueChange,
  items,
  listProps,
  ...rootProps
}: TabsProps) {
  return (
    <ChakraTabs.Root
      colorPalette="brand"
      // `plain` because the pills below draw their own state; the underlined
      // strip would draw a second one over them.
      variant="plain"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (e) => onValueChange(e.value) : undefined}
      {...rootProps}
    >
      {/* Wrapping, not scrolling: a strip that scrolls hides the sections
          past its edge, and a phone holding five of them would hide three. */}
      <ChakraTabs.List {...pillTabListProps} {...listProps}>
        {items.map((item) => (
          <ChakraTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            {...pillTabTriggerProps}
            {...item.triggerProps}
          >
            {item.label}
          </ChakraTabs.Trigger>
        ))}
      </ChakraTabs.List>
      {items.map((item) => (
        <ChakraTabs.Content
          key={item.value}
          value={item.value}
          {...item.contentProps}
        >
          {item.content}
        </ChakraTabs.Content>
      ))}
    </ChakraTabs.Root>
  )
}

export { Tabs }
