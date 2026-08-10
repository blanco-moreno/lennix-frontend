import { Grid, type GridProps } from '@chakra-ui/react'

/**
 * The base shell of every listing row — `/projects`, `/tasks`, `/drafts`,
 * `/trash`, `/approvals` and the dashboard all lay their rows on this grid.
 * A row supplies its column template and its cells; what makes the rows one
 * family (the gutter, the row rule, the hover, the panel background) lives
 * here once. Headers reuse the same shell with `bg="bg.subtle"` and no hover.
 */
export function ListRow(
  props: GridProps & { ref?: React.Ref<HTMLDivElement> },
) {
  return (
    <Grid
      role="row"
      alignItems="center"
      // Below `lg` the cells are stacked rows, not columns: the gap they need
      // is vertical, and a horizontal one there only pushes the content away
      // from the leading control. From `lg` it is the other way round — one
      // line, so only the column gap does anything.
      columnGap={{ base: 0, lg: 'tight' }}
      rowGap={{ base: 2, lg: 0 }}
      px="tight"
      py={{ base: 3, lg: 2 }}
      // The app is operated on a tablet, on site, sometimes with gloves. A
      // row is a tap target before it is a layout, so it never renders under
      // the touch floor whatever its cells happen to measure.
      minH="touch"
      borderBottomWidth="1px"
      borderColor="border"
      bg="bg.panel"
      _hover={{ bg: 'bg.muted/50' }}
      {...props}
    />
  )
}
