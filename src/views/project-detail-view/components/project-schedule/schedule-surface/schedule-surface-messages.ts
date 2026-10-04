import { defineMessages } from 'react-intl'

export const scheduleSurfaceMessages = defineMessages({
  heading: {
    id: 'scheduleSurface.heading',
    defaultMessage: 'Schedule',
    description: 'Title of the unified schedule surface',
  },
  filterAll: {
    id: 'scheduleSurface.filterAll',
    defaultMessage: 'Everything',
    description: 'Filter that shows the whole schedule',
  },
  filterCritical: {
    id: 'scheduleSurface.filterCritical',
    defaultMessage: 'Critical only',
    description: 'Filter that shows only critical-path rows',
  },
  filterDelayed: {
    id: 'scheduleSurface.filterDelayed',
    defaultMessage: 'Delayed',
    description: 'Filter that shows only rows carrying propagated delay',
  },
  filterAtRisk: {
    id: 'scheduleSurface.filterAtRisk',
    defaultMessage: 'At risk',
    description: 'Filter that shows only blocked rows',
  },
  dependenciesDrawerTitle: {
    id: 'scheduleSurface.dependenciesDrawerTitle',
    defaultMessage: 'Dependencies',
    description: 'Title of the dependency drawer over the schedule',
  },
  hiddenEdges: {
    id: 'scheduleSurface.hiddenEdges',
    defaultMessage:
      '{count, plural, one {# link is not drawn in this view} other {# links are not drawn in this view}}',
    description:
      'Filtering or collapsing hid rows and with them their dependency arrows — this says so instead of letting them vanish silently',
  },
  kpiBroken: {
    id: 'scheduleSurface.kpiBroken',
    defaultMessage:
      '{count, plural, one {# broken link} other {# broken links}}',
    description: 'Headline count of broken dependencies',
  },
  brokenHeading: {
    id: 'scheduleSurface.brokenHeading',
    defaultMessage:
      '{count, plural, one {Broken link} other {Broken links}} ({count})',
    description:
      'Title of the broken-link list under the chart — the only dependencies the schedule still lists itself',
  },
  selectedNone: {
    id: 'scheduleSurface.selectedNone',
    defaultMessage: 'Pick a row to act on it, or open it to read its links.',
    description: 'Hint shown when no schedule row is selected',
  },
})
