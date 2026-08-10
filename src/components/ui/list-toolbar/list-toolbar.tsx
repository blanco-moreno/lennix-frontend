import { Stack, type StackProps } from '@chakra-ui/react'

/**
 * The control zone of a `ListPanel`: the filter (or bulk) controls with the
 * paginator beneath them. The panel owns the gutter, so the toolbar carries
 * no frame or padding of its own — the same grammar on every list view.
 */
export function ListToolbar(props: StackProps) {
  return <Stack gap={2} {...props} />
}
