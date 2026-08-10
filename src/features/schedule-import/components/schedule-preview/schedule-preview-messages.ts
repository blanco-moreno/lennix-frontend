import { defineMessages } from 'react-intl'

export const schedulePreviewMessages = defineMessages({
  title: {
    id: 'schedulePreview.title',
    defaultMessage: 'This is the schedule that goes live',
    description: 'Heading of the read-only Gantt preview on the confirm step',
  },
  explainer: {
    id: 'schedulePreview.explainer',
    defaultMessage:
      'Dates and links exactly as Lennix read them. Delay, critical path and progress start being computed the moment you activate.',
    description:
      'Why the preview shows no critical path: the engine has not run yet',
  },
  summary: {
    id: 'schedulePreview.summary',
    defaultMessage:
      '{phases, plural, one {# phase} other {# phases}} · {activities, plural, one {# activity} other {# activities}} · {start} → {end} ({days, plural, one {# day} other {# days}})',
    description:
      'One-line vitals of the imported schedule: row counts and the full span — the sanity check before activating',
  },
  edgeCount: {
    id: 'schedulePreview.edgeCount',
    defaultMessage:
      '{count, plural, =0 {No links between activities} one {# link between activities} other {# links between activities}}',
    description: 'How many dependency edges the preview draws',
  },
})
