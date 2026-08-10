/**
 * The portfolio home. Not a second projects page: what lands here is portfolio
 * health — hero KPIs, drafts waiting, and the projects that are slipping.
 */

import { Stack } from '@chakra-ui/react'

import { DashboardDrafts } from './components/dashboard-drafts'
import { DashboardHeader } from './components/dashboard-header'
import { DashboardKpis } from './components/dashboard-kpis'
import { PortfolioHealth } from './components/portfolio-health'

export function HomeView() {
  return (
    <Stack gap="block" minH="100%" px="gutter" py="gutterY">
      <DashboardHeader />
      {/* Attention before metrics: a draft waiting for review is something to
       *do* this morning; the KPIs are something to *know*. */}
      <DashboardDrafts />
      <DashboardKpis />
      <PortfolioHealth />
    </Stack>
  )
}
