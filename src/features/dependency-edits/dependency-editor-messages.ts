import { defineMessages } from 'react-intl'

export const dependencyEditorMessages = defineMessages({
  edgeLabel: {
    id: 'dependencyEditor.edgeLabel',
    defaultMessage: '{predecessor} → {successor}',
    description: 'One dependency edge, predecessor first',
  },
  relationshipLegend: {
    id: 'dependencyEditor.relationshipLegend',
    defaultMessage: 'Type',
    description: 'Label of the FS/SS/FF/SF selector',
  },
  relationshipFS: {
    id: 'dependencyEditor.relationshipFS',
    defaultMessage: 'FS',
    description: 'Finish-to-start relationship, short form',
  },
  relationshipSS: {
    id: 'dependencyEditor.relationshipSS',
    defaultMessage: 'SS',
    description: 'Start-to-start relationship, short form',
  },
  relationshipFF: {
    id: 'dependencyEditor.relationshipFF',
    defaultMessage: 'FF',
    description: 'Finish-to-finish relationship, short form',
  },
  relationshipSF: {
    id: 'dependencyEditor.relationshipSF',
    defaultMessage: 'SF',
    description: 'Start-to-finish relationship, short form',
  },
  relationshipFSHelp: {
    id: 'dependencyEditor.relationshipFSHelp',
    defaultMessage: 'starts when the other finishes',
    description: 'Plain-language meaning of finish-to-start',
  },
  relationshipSSHelp: {
    id: 'dependencyEditor.relationshipSSHelp',
    defaultMessage: 'starts when the other starts',
    description: 'Plain-language meaning of start-to-start',
  },
  relationshipFFHelp: {
    id: 'dependencyEditor.relationshipFFHelp',
    defaultMessage: 'finishes when the other finishes',
    description: 'Plain-language meaning of finish-to-finish',
  },
  relationshipSFHelp: {
    id: 'dependencyEditor.relationshipSFHelp',
    defaultMessage: 'finishes when the other starts',
    description: 'Plain-language meaning of start-to-finish',
  },
  // The long forms. FS/SS/FF/SF is precise international notation and says
  // nothing to a reader who has not met it, so the tooltip spells out the name
  // as well as the rule, with the site example that makes it concrete.
  relationshipFSLong: {
    id: 'dependencyEditor.relationshipFSLong',
    defaultMessage:
      'Finish → Start. This activity cannot start until its predecessor finishes. The usual link: you pour the slab after the formwork is done.',
    description: 'Tooltip explaining finish-to-start',
  },
  relationshipSSLong: {
    id: 'dependencyEditor.relationshipSSLong',
    defaultMessage:
      'Start → Start. Both start together, and this one cannot start first. Excavating and hauling spoil run side by side.',
    description: 'Tooltip explaining start-to-start',
  },
  relationshipFFLong: {
    id: 'dependencyEditor.relationshipFFLong',
    defaultMessage:
      'Finish → Finish. This activity cannot finish until its predecessor does. Inspection closes when the work it inspects closes.',
    description: 'Tooltip explaining finish-to-finish',
  },
  relationshipSFLong: {
    id: 'dependencyEditor.relationshipSFLong',
    defaultMessage:
      'Start → Finish. This activity cannot finish until its predecessor starts. Rare — mostly shift handovers, where the old crew leaves once the new one arrives.',
    description: 'Tooltip explaining start-to-finish',
  },
  addUpstream: {
    id: 'dependencyEditor.addUpstream',
    defaultMessage: 'Add something this waits for',
    description:
      'Label of the picker that creates a predecessor link, above the "waits for" list',
  },
  addDownstream: {
    id: 'dependencyEditor.addDownstream',
    defaultMessage: 'Add something waiting on this',
    description:
      'Label of the picker that creates a successor link, above the "blocks" list',
  },
  addPlaceholder: {
    id: 'dependencyEditor.addPlaceholder',
    defaultMessage: 'Search an activity…',
    description: 'Empty state of the add-link picker, which is a search box',
  },
  addSubmit: {
    id: 'dependencyEditor.addSubmit',
    defaultMessage: 'Link',
    description: 'Button that creates the picked dependency',
  },
  addCancel: {
    id: 'dependencyEditor.addCancel',
    defaultMessage: 'Cancel',
    description: 'Closes the link composer without creating anything',
  },
  addOpenUpstream: {
    id: 'dependencyEditor.addOpenUpstream',
    defaultMessage: 'Add predecessor',
    description: 'Button that opens the composer on the "waits for" list',
  },
  addOpenDownstream: {
    id: 'dependencyEditor.addOpenDownstream',
    defaultMessage: 'Add successor',
    description: 'Button that opens the composer on the "blocks" list',
  },
  addOpen: {
    id: 'dependencyEditor.addOpen',
    defaultMessage: 'Add a dependency',
    description:
      'Button that opens the composer on a list of every edge, which is about no single row',
  },
  addNoCandidates: {
    id: 'dependencyEditor.addNoCandidates',
    defaultMessage: 'Nothing left to link: every legal pairing already exists.',
    description:
      'Shown instead of the add-link picker when the pairing rule leaves no candidate',
  },
  addNoMatch: {
    id: 'dependencyEditor.addNoMatch',
    defaultMessage: 'No activity by that name.',
    description: 'Picker search found nothing',
  },
  // The rows that cannot be linked stay in the list, disabled, each carrying
  // the reason. Hiding them sends a user who knows the row exists looking for
  // it; the reason is what teaches the shape of the graph, at the moment it
  // matters. They are worded from the picked row's side — the reader is
  // choosing *that* row, and wants to know what is wrong with *it*.
  reasonDuplicate: {
    id: 'dependencyEditor.reasonDuplicate',
    defaultMessage: 'Already linked',
    description: 'Picker: this pair already carries an edge in this direction',
  },
  reasonInverseUpstream: {
    id: 'dependencyEditor.reasonInverseUpstream',
    defaultMessage: 'Already waits for this one',
    description:
      'Picker, predecessor side: the picked row is already a successor, so the link would be a two-row loop',
  },
  reasonInverseDownstream: {
    id: 'dependencyEditor.reasonInverseDownstream',
    defaultMessage: 'This one already waits for it',
    description:
      'Picker, successor side: the picked row is already a predecessor, so the link would be a two-row loop',
  },
  reasonCycleVia: {
    id: 'dependencyEditor.reasonCycleVia',
    defaultMessage: 'Would create a loop, via {row}',
    description:
      'Picker: a chain already runs between the two rows, so the link would close it',
  },
  reasonOtherPhase: {
    id: 'dependencyEditor.reasonOtherPhase',
    defaultMessage: 'Another phase',
    description:
      'Picker: two subactivities can only be linked under the same main activity',
  },
  reasonIsPhase: {
    id: 'dependencyEditor.reasonIsPhase',
    defaultMessage: 'Is a main activity',
    description: 'Picker: a subactivity cannot be linked to a main activity',
  },
  reasonIsSubtask: {
    id: 'dependencyEditor.reasonIsSubtask',
    defaultMessage: 'Is a subactivity',
    description: 'Picker: a main activity cannot be linked to a subactivity',
  },
  showBlocked: {
    id: 'dependencyEditor.showBlocked',
    defaultMessage:
      '{count, plural, one {Show # that cannot be linked} other {Show # that cannot be linked}}',
    description:
      'Reveals the rejected rows, kept out of the default list so a large project does not open on a wall of greyed-out names',
  },
  hideBlocked: {
    id: 'dependencyEditor.hideBlocked',
    defaultMessage: 'Hide the ones that cannot be linked',
    description: 'Folds the rejected rows back away',
  },
  composerType: {
    id: 'dependencyEditor.composerType',
    defaultMessage: 'Type',
    description: 'Label of the FS/SS/FF/SF choice inside the link composer',
  },
  lagLabel: {
    id: 'dependencyEditor.lagLabel',
    defaultMessage: 'Lag (days; negative starts earlier)',
    description: 'Label of the lag input, saying out loud that negative = lead',
  },
  removeEdge: {
    id: 'dependencyEditor.removeEdge',
    defaultMessage: 'Remove',
    description: 'Action that deletes a dependency',
  },
  edgeUpdated: {
    id: 'dependencyEditor.edgeUpdated',
    defaultMessage: 'Dependency updated.',
    description: 'Toast after editing a dependency type or lag',
  },
  edgeUpdateFailed: {
    id: 'dependencyEditor.edgeUpdateFailed',
    defaultMessage: 'Could not update the dependency. Try again.',
    description: 'Toast when the dependency edit fails',
  },
  edgeCreated: {
    id: 'dependencyEditor.edgeCreated',
    defaultMessage: 'Dependency created.',
    description: 'Toast after linking two rows',
  },
  edgeCreateFailed: {
    id: 'dependencyEditor.edgeCreateFailed',
    defaultMessage: 'Could not create the dependency. Try again.',
    description: 'Toast when creating a dependency fails',
  },
  edgeRemoved: {
    id: 'dependencyEditor.edgeRemoved',
    defaultMessage: 'Dependency removed.',
    description: 'Toast after deleting a dependency',
  },
  edgeRemoveFailed: {
    id: 'dependencyEditor.edgeRemoveFailed',
    defaultMessage: 'Could not remove the dependency. Try again.',
    description: 'Toast when deleting a dependency fails',
  },
  rejectedSelf: {
    id: 'dependencyEditor.rejectedSelf',
    defaultMessage: 'A row cannot depend on itself.',
    description: 'Why a link was refused before reaching the server',
  },
  rejectedPairing: {
    id: 'dependencyEditor.rejectedPairing',
    defaultMessage:
      'Link main activities to each other, or subactivities under the same main activity.',
    description: 'Why an illegal pairing was refused',
  },
  rejectedDuplicate: {
    id: 'dependencyEditor.rejectedDuplicate',
    defaultMessage: 'That dependency already exists.',
    description: 'Why a duplicate link was refused',
  },
  rejectedCycle: {
    id: 'dependencyEditor.rejectedCycle',
    defaultMessage:
      'That link would create a loop: the two activities already wait on each other.',
    description: 'Why a link that closes a cycle was refused before the server',
  },
  rejectedCycleServer: {
    id: 'dependencyEditor.rejectedCycleServer',
    defaultMessage:
      'That link would create a loop. Somebody changed the graph while this panel was open — reopen it to see the current links.',
    description:
      'The server refused a link the picker had judged legal: the graph moved between the read and the click. Retrying will not help, so the toast says what to do instead',
  },
})
