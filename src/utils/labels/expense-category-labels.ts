import type { MessageDescriptor } from 'react-intl'

import { expenseManagementMessages as m } from './expense-messages'

/**
 * Expense category → display label. One map for every surface that renders a
 * category (the project/task expense tabs, the create/edit modals), so a
 * category never reads differently across screens.
 */
export const CATEGORY_LABEL = {
  labor: m.categoryLabor,
  materials: m.categoryMaterials,
  equipment: m.categoryEquipment,
  subcontractor: m.categorySubcontractor,
  other: m.categoryOther,
} as const

/** The category choices offered by the expense create/edit modals. */
export const CATEGORY_OPTIONS: Array<{
  value: string
  label: MessageDescriptor
}> = [
  { value: 'labor', label: m.categoryLabor },
  { value: 'materials', label: m.categoryMaterials },
  { value: 'equipment', label: m.categoryEquipment },
  { value: 'subcontractor', label: m.categorySubcontractor },
  { value: 'other', label: m.categoryOther },
]
