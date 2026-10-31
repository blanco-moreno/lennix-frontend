import { defineMessages, type MessageDescriptor } from 'react-intl'

import type { IndirectCategory } from '@/types'

/**
 * Overhead line → display label (ms-bk `BUD-11`). One map for every surface
 * that names a line: the budget tab, the expense form, the Historial.
 */
export const indirectCategoryMessages = defineMessages({
  staff: {
    id: 'indirectCategory.staff',
    defaultMessage: 'Site staff',
    description: 'Overhead line: site manager, foremen, safety staff',
  },
  transport: {
    id: 'indirectCategory.transport',
    defaultMessage: 'Transport',
    description: 'Overhead line: freight, vehicles, travel',
  },
  site_setup: {
    id: 'indirectCategory.site_setup',
    defaultMessage: 'Site setup',
    description: 'Overhead line: instalación de faena',
  },
  food_lodging: {
    id: 'indirectCategory.food_lodging',
    defaultMessage: 'Food and lodging',
    description: 'Overhead line: meals and accommodation for the crew',
  },
  general: {
    id: 'indirectCategory.general',
    defaultMessage: 'General overheads',
    description: 'Overhead line: overheads stated without a breakdown',
  },
  other: {
    id: 'indirectCategory.other',
    defaultMessage: 'Other overheads',
    description: 'Overhead line: anything else spent on the project as a whole',
  },
}) satisfies Record<IndirectCategory, MessageDescriptor>
