/**
 * The only KPI tile grid in the app. Every hero KPI — portfolio or
 * project — is rendered here, so a metric cannot drift into a second shape.
 */

import { Box, SimpleGrid } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router'

import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card'
import { heroKpiMessages as m, type HeroKpi } from '@/utils'

/**
 * The tiles wrap on their own width instead of being told a column count. A
 * fixed two-up squeezed two tiles into ~150px each on a 320px phone and still
 * stopped at the number the breakpoint named on a wide screen; with a minimum,
 * a row holds as many as fit and drops to one when it cannot. The skeleton
 * uses it too — that is what keeps the two the same shape.
 */
function TileGrid({
  children,
  isLoading = false,
}: {
  children: ReactNode
  isLoading?: boolean
}) {
  return (
    <SimpleGrid
      minChildWidth="12rem"
      gap={{ base: 'tight', sm: 4 }}
      aria-busy={isLoading || undefined}
      data-testid={isLoading ? undefined : 'hero-kpi-grid'}
    >
      {children}
    </SimpleGrid>
  )
}

export interface HeroKpisProps {
  kpis: HeroKpi[]
  isLoading?: boolean
  hasError?: boolean
  /** `card` wraps each tile in a Card — used on the dashboard. */
  variant?: 'panel' | 'card'
}

export function HeroKpis({
  kpis,
  isLoading = false,
  hasError = false,
  variant = 'panel',
}: HeroKpisProps) {
  const intl = useIntl()

  // The tiles load as tiles, in the grid that lays out the real ones — same
  // wrap, same count, same height, so the row never resizes when they land.
  if (isLoading) {
    return (
      <TileGrid isLoading>
        {Array.from({ length: kpis.length || 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </TileGrid>
    )
  }

  if (hasError) {
    return (
      <Box color="error" py={4} textAlign="center">
        {intl.formatMessage(m.error)}
      </Box>
    )
  }

  const formatValue = (kpi: HeroKpi): string => {
    if (kpi.value === null) return intl.formatMessage(m.valueNone)
    if (kpi.unit === 'days')
      return intl.formatMessage(m.valueDays, { days: kpi.value })
    if (kpi.unit === 'percent')
      return intl.formatNumber(kpi.value / 100, {
        style: 'percent',
        maximumFractionDigits: 0,
      })
    return intl.formatNumber(kpi.value)
  }

  return (
    <TileGrid>
      {kpis.map((kpi) => {
        const tile = (
          <StatCard
            variant={variant}
            icon={kpi.icon}
            semantic={kpi.semantic}
            label={intl.formatMessage(kpi.label)}
            value={formatValue(kpi)}
          />
        )
        // A KPI with a destination is a link, not a tile with a click handler:
        // it is an address, so it opens in a new tab, copies, and reads as
        // navigable to a screen reader without any of that being re-implemented.
        return kpi.href ? (
          <Box
            key={kpi.id}
            asChild
            display="block"
            rounded="xl"
            _hover={{ opacity: 0.9 }}
          >
            <Link to={kpi.href} data-testid={`hero-kpi-link-${kpi.id}`}>
              {tile}
            </Link>
          </Box>
        ) : (
          <Box key={kpi.id}>{tile}</Box>
        )
      })}
    </TileGrid>
  )
}
