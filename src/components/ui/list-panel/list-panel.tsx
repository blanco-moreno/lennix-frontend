import { Card, type CardProps } from '../card/card'

/**
 * A `Card` that is a listing surface. It carries no spacing of its own — the
 * card tokens are the spacing, so a per-consumer `gap`/`p` cannot drift across
 * every list view and both halves of `DetailShell`.
 */
export function ListPanel(props: CardProps) {
  return <Card {...props} />
}
