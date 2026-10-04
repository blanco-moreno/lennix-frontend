import { defineMessages } from 'react-intl'

export const draftReviewCanvasMessages = defineMessages({
  loadFailedTitle: {
    id: 'draftReviewCanvas.loadFailedTitle',
    defaultMessage: 'This draft could not be loaded',
    description: 'Error state when the resumable review state does not load',
  },
  loadFailedDescription: {
    id: 'draftReviewCanvas.loadFailedDescription',
    defaultMessage:
      'It may have been deleted or activated already. Check your drafts.',
    description: 'Guidance for a draft that cannot be opened',
  },
  goToDrafts: {
    id: 'draftReviewCanvas.goToDrafts',
    defaultMessage: 'Go to drafts',
    description: 'Action returning to the drafts home',
  },
  liveTitle: {
    id: 'draftReviewCanvas.liveTitle',
    defaultMessage: 'This schedule is already live',
    description:
      'Shown when the review route is opened for a project that was activated',
  },
  liveDescription: {
    id: 'draftReviewCanvas.liveDescription',
    defaultMessage: 'Open the project to see its schedule.',
    description: 'Guidance for an already-activated project',
  },
  openProject: {
    id: 'draftReviewCanvas.openProject',
    defaultMessage: 'Open project',
    description: 'Action opening the live project',
  },
  divertedTitle: {
    id: 'draftReviewCanvas.divertedTitle',
    defaultMessage: 'This file needs manual mapping',
    description:
      'Shown when a draft carries the quality-floor outcome instead of a schedule',
  },
  divertedDescription: {
    id: 'draftReviewCanvas.divertedDescription',
    defaultMessage: 'It could not be read as a schedule.',
    description: 'Why the canvas refuses to render this draft',
  },
  saveSuccess: {
    id: 'draftReviewCanvas.saveSuccess',
    defaultMessage: 'Draft saved',
    description: 'Toast after the wizard writes the draft',
  },
  stepSaveFailed: {
    id: 'draftReviewCanvas.stepSaveFailed',
    defaultMessage: 'Your changes are saved, but the step you were on was not.',
    description: 'Toast when persisting the review step fails',
  },
  scheduleTitle: {
    id: 'draftReviewCanvas.scheduleTitle',
    defaultMessage: 'Review activities and dates',
    description: 'Schedule step heading',
  },
  budgetTitle: {
    id: 'draftReviewCanvas.budgetTitle',
    defaultMessage: 'Split per main activity',
    description: 'Budget step heading',
  },
  confirmTitle: {
    id: 'draftReviewCanvas.confirmTitle',
    defaultMessage: 'What goes live',
    description: 'Confirm step heading',
  },
  confirmLine: {
    id: 'draftReviewCanvas.confirmLine',
    defaultMessage:
      'Activating starts the delay and critical-path calculations.',
    description: 'The one consequence of activating, under the confirm heading',
  },
})
