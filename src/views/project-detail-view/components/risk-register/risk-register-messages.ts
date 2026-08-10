import { defineMessages } from 'react-intl'

/**
 * Catalog for the project risk register — the 3×3
 * probability×impact matrix and the list/form beneath it.
 *
 * Wording is deliberately AEC-plain: "probabilidad" and "impacto" are the words
 * a contractor already uses, and a cell is described by what it means, not by
 * its numeric score.
 */
export const riskRegisterMessages = defineMessages({
  title: {
    id: 'riskRegister.title',
    defaultMessage: 'Risk register',
    description: 'Heading of the risk register',
  },
  subtitle: {
    id: 'riskRegister.subtitle',
    defaultMessage:
      'What could go wrong on this project, how likely it is and how hard it would hit.',
    description: 'Subtitle of the risk register',
  },
  matrixTitle: {
    id: 'riskRegister.matrixTitle',
    defaultMessage: 'Probability × impact',
    description: 'Heading of the 3x3 matrix',
  },
  axisProbability: {
    id: 'riskRegister.axisProbability',
    defaultMessage: 'Probability',
    description: 'Vertical axis label of the matrix',
  },
  axisImpact: {
    id: 'riskRegister.axisImpact',
    defaultMessage: 'Impact',
    description: 'Horizontal axis label of the matrix',
  },
  levelLow: {
    id: 'riskRegister.levelLow',
    defaultMessage: 'Low',
    description: '3x3 axis level',
  },
  levelMedium: {
    id: 'riskRegister.levelMedium',
    defaultMessage: 'Medium',
    description: '3x3 axis level',
  },
  levelHigh: {
    id: 'riskRegister.levelHigh',
    defaultMessage: 'High',
    description: '3x3 axis level',
  },
  cellLabel: {
    id: 'riskRegister.cellLabel',
    defaultMessage:
      '{count, plural, one {# risk} other {# risks}} — probability {probability}, impact {impact}',
    description: 'Accessible label of a matrix cell',
  },
  cellFilterHint: {
    id: 'riskRegister.cellFilterHint',
    defaultMessage: 'Showing the {probability} × {impact} cell',
    description: 'Shown when a matrix cell filters the list',
  },
  clearCellFilter: {
    id: 'riskRegister.clearCellFilter',
    defaultMessage: 'Show all',
    description: 'Clears the matrix cell filter',
  },

  listTitle: {
    id: 'riskRegister.listTitle',
    defaultMessage: 'Risks',
    description: 'Heading of the risk list',
  },
  addRisk: {
    id: 'riskRegister.addRisk',
    defaultMessage: 'Add risk',
    description: 'Button that opens the risk form',
  },
  emptyTitle: {
    id: 'riskRegister.emptyTitle',
    defaultMessage: 'No risks registered yet',
    description: 'Empty state title',
  },
  emptyBody: {
    id: 'riskRegister.emptyBody',
    defaultMessage:
      'Register what worries you about this project — a risk written down is one someone can own.',
    description: 'Empty state body',
  },
  loadError: {
    id: 'riskRegister.loadError',
    defaultMessage: 'The risk register could not be loaded',
    description: 'Shown when the risk list fails to load',
  },

  statusOpen: {
    id: 'riskRegister.statusOpen',
    defaultMessage: 'Open',
    description: 'Risk status',
  },
  statusMitigating: {
    id: 'riskRegister.statusMitigating',
    defaultMessage: 'Mitigating',
    description: 'Risk status',
  },
  statusClosed: {
    id: 'riskRegister.statusClosed',
    defaultMessage: 'Closed',
    description: 'Risk status',
  },

  strategyNone: {
    id: 'riskRegister.strategyNone',
    defaultMessage: 'Not decided',
    description: 'Response strategy placeholder',
  },
  strategyAvoid: {
    id: 'riskRegister.strategyAvoid',
    defaultMessage: 'Avoid',
    description: 'PMI response strategy',
  },
  strategyMitigate: {
    id: 'riskRegister.strategyMitigate',
    defaultMessage: 'Mitigate',
    description: 'PMI response strategy',
  },
  strategyTransfer: {
    id: 'riskRegister.strategyTransfer',
    defaultMessage: 'Transfer',
    description: 'PMI response strategy',
  },
  strategyAccept: {
    id: 'riskRegister.strategyAccept',
    defaultMessage: 'Accept',
    description: 'PMI response strategy',
  },

  // --- Form ---
  formCreateTitle: {
    id: 'riskRegister.formCreateTitle',
    defaultMessage: 'New risk',
    description: 'Title of the risk form when creating',
  },
  formEditTitle: {
    id: 'riskRegister.formEditTitle',
    defaultMessage: 'Edit risk',
    description: 'Title of the risk form when editing',
  },
  formDescription: {
    id: 'riskRegister.formDescription',
    defaultMessage:
      'For {project} — probability and impact place the risk on the matrix; the response strategy says what you intend to do about it.',
    description: 'Subtitle of the risk form, naming the project',
  },
  fieldTitle: {
    id: 'riskRegister.fieldTitle',
    defaultMessage: 'Risk',
    description: 'Label of the title field',
  },
  fieldTitlePlaceholder: {
    id: 'riskRegister.fieldTitlePlaceholder',
    defaultMessage: 'e.g. Late delivery of structural steel',
    description: 'Placeholder of the title field',
  },
  fieldDescription: {
    id: 'riskRegister.fieldDescription',
    defaultMessage: 'Description',
    description: 'Label of the description field',
  },
  fieldCategory: {
    id: 'riskRegister.fieldCategory',
    defaultMessage: 'Category',
    description: 'Label of the category field',
  },
  fieldProbability: {
    id: 'riskRegister.fieldProbability',
    defaultMessage: 'Probability',
    description: 'Label of the probability select',
  },
  fieldImpact: {
    id: 'riskRegister.fieldImpact',
    defaultMessage: 'Impact',
    description: 'Label of the impact select',
  },
  fieldStrategy: {
    id: 'riskRegister.fieldStrategy',
    defaultMessage: 'Response strategy',
    description: 'Label of the strategy select',
  },
  fieldMitigation: {
    id: 'riskRegister.fieldMitigation',
    defaultMessage: 'Mitigation plan',
    description: 'Label of the mitigation field',
  },
  fieldStatus: {
    id: 'riskRegister.fieldStatus',
    defaultMessage: 'Status',
    description: 'Label of the status select',
  },
  formSubmit: {
    id: 'riskRegister.formSubmit',
    defaultMessage: 'Save risk',
    description: 'Submit button of the risk form',
  },
  createSuccess: {
    id: 'riskRegister.createSuccess',
    defaultMessage: 'Risk registered',
    description: 'Toast after creating a risk',
  },
  updateSuccess: {
    id: 'riskRegister.updateSuccess',
    defaultMessage: 'Risk updated',
    description: 'Toast after updating a risk',
  },
  saveError: {
    id: 'riskRegister.saveError',
    defaultMessage: 'The risk could not be saved',
    description: 'Toast when a risk write fails',
  },
  deleteRisk: {
    id: 'riskRegister.deleteRisk',
    defaultMessage: 'Delete risk',
    description: 'Delete action on a risk row',
  },
  deleteSuccess: {
    id: 'riskRegister.deleteSuccess',
    defaultMessage: 'Risk deleted',
    description: 'Toast after deleting a risk',
  },
  deleteError: {
    id: 'riskRegister.deleteError',
    defaultMessage: 'The risk could not be deleted',
    description: 'Toast when deleting a risk fails',
  },
  editRisk: {
    id: 'riskRegister.editRisk',
    defaultMessage: 'Edit risk',
    description: 'Edit action on a risk row',
  },

  // --- Delay-cause distribution ---
  delayCausesTitle: {
    id: 'riskRegister.delayCausesTitle',
    defaultMessage: 'Why work slipped',
    description: 'Heading of the delay-cause distribution',
  },
  delayCausesBody: {
    id: 'riskRegister.delayCausesBody',
    defaultMessage:
      'Recorded causes across the schedule. The delay itself is shown on the bars it belongs to, in the schedule.',
    description: 'Body of the delay-cause distribution',
  },
  tasksCountBadge: {
    id: 'riskRegister.tasksCountBadge',
    defaultMessage: '{count, plural, one {# activity} other {# activities}}',
    description: 'Count badge per delay cause',
  },
})
