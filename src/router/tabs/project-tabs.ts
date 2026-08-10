/** The project-detail tab set; the selected tab lives in the URL (`?tab=`). */

export const PROJECT_TABS = [
  'schedule',
  'budget',
  'team',
  'risks',
  'history',
] as const

export type ProjectTab = (typeof PROJECT_TABS)[number]

export const PROJECT_TAB_PARAM = 'tab'

/** The schedule is the project home: anything unresolvable lands there. */
export const DEFAULT_PROJECT_TAB: ProjectTab = 'schedule'

interface ResolveOptions {
  /** Budget is permission-gated; a link to it must not open an empty tab. */
  canViewBudget: boolean
  /**
   * Risks is permission-gated too (`project.tabs.risks.view`). The register is
   * a real write surface, so a deep link from someone without the key has to
   * land on the schedule instead of an empty tab.
   */
  canViewRisks: boolean
}

export function resolveProjectTab(
  value: string | null | undefined,
  { canViewBudget, canViewRisks }: ResolveOptions,
): ProjectTab {
  const candidate = PROJECT_TABS.find((tab) => tab === value)
  if (!candidate) return DEFAULT_PROJECT_TAB
  if (candidate === 'budget' && !canViewBudget) return DEFAULT_PROJECT_TAB
  if (candidate === 'risks' && !canViewRisks) return DEFAULT_PROJECT_TAB
  return candidate
}
