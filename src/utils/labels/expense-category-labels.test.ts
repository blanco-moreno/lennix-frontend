import type { ExpenseCategoryDTO } from '@/types/dto/expense-dto'

import enMessages from '../../../lang/en.json'

import { CATEGORY_LABEL, CATEGORY_OPTIONS } from './expense-category-labels'

/**
 * The backend's closed `ExpenseCategory` vocabulary
 * (lennix-ms-bk/app/expenses/constants.py). A category the backend can emit
 * but this map cannot label would render blank across every expense surface.
 */
const BACKEND_CATEGORIES: readonly ExpenseCategoryDTO[] = [
  'labor',
  'materials',
  'equipment',
  'subcontractor',
  'other',
]

describe('expense category labels', () => {
  it('labels exactly the backend category vocabulary', () => {
    expect(Object.keys(CATEGORY_LABEL).sort()).toEqual(
      [...BACKEND_CATEGORIES].sort(),
    )
  })

  it('offers the same categories in the create/edit modals, with the same descriptors', () => {
    expect(CATEGORY_OPTIONS.map((o) => o.value).sort()).toEqual(
      [...BACKEND_CATEGORIES].sort(),
    )
    for (const option of CATEGORY_OPTIONS) {
      expect(option.label).toBe(
        CATEGORY_LABEL[option.value as ExpenseCategoryDTO],
      )
    }
  })

  it('backs every label with a real catalog entry', () => {
    for (const descriptor of Object.values(CATEGORY_LABEL)) {
      expect(descriptor.id).toBeDefined()
      expect(
        (enMessages as Record<string, string>)[descriptor.id as string],
      ).toBeTruthy()
    }
  })
})
