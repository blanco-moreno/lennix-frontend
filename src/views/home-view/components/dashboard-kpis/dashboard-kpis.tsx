/**
 * The dashboard's KPI row — the portfolio face of the ONE KPI system. It
 * renders the hero signals and owns no metric definition of its own.
 */

import { Card, HeroKpis } from '@/components'
import { usePortfolioKpis } from '@/hooks'

export function DashboardKpis() {
  const { kpis, isLoading, hasError } = usePortfolioKpis()

  // One raised board across the full width, tiles as panels inside it: four
  // separate small cards on a subtle ground read as four unrelated widgets,
  // and the `panel` variant is the one that renders the number large.
  return (
    <Card>
      <HeroKpis
        variant="panel"
        kpis={kpis}
        isLoading={isLoading}
        hasError={hasError}
      />
    </Card>
  )
}
