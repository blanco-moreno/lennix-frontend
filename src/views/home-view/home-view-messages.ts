import { defineMessages } from 'react-intl'

export const homeViewMessages = defineMessages({
  // Header
  title: {
    id: 'homeDashboard.title',
    defaultMessage: 'Management dashboard',
    description: 'Main title of the home dashboard screen',
  },
  subtitle: {
    id: 'homeDashboard.subtitle',
    defaultMessage: 'Portfolio health: what is slipping and what is waiting',
    description: 'Subtitle under the home dashboard title',
  },
  // Same dashboard, narrower numbers: a manager's aggregates only count the
  // obras they belong to, so the lead line has to say so — otherwise one
  // slipping obra reads as the whole company slipping.
  subtitleScoped: {
    id: 'homeDashboard.subtitleScoped',
    defaultMessage: 'Your obras: what is slipping and what is waiting',
    description: 'Subtitle of the home dashboard for a member-scoped role',
  },
  /**
   * ORPHAN — no longer rendered. The header dropped it in the v2 redesign: it
   * was formatted from the browser clock, so it only ever said "now", never
   * anything about the data. Kept here and in `lang/*.json` so the
   * translations survive if a real data-freshness signal earns the line back.
   */
  lastUpdated: {
    id: 'homeDashboard.lastUpdated',
    defaultMessage: 'Updated: {date}',
    description:
      'Timestamp in the home dashboard header showing when the data was last refreshed',
  },

  // Drafts nudge — one line that deep-links to the drafts home.
  draftsNudge: {
    id: 'homeDashboard.draftsNudge',
    defaultMessage:
      '{count, plural, one {# draft waiting for you} other {# drafts waiting for you}}',
    description:
      'Single dashboard nudge stating how many imported drafts are pending',
  },
  draftsGoToDrafts: {
    id: 'homeDashboard.draftsGoToDrafts',
    defaultMessage: 'Open drafts',
    description: 'Button on the nudge that deep-links to the drafts home',
  },
})
