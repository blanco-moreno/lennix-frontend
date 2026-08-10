import { EXPENSE_CATEGORY_VARIANT } from './expense-category'

describe('EXPENSE_CATEGORY_VARIANT', () => {
  it.each([
    ['labor', 'info'],
    ['materials', 'complementary'],
    ['equipment', 'warning'],
    ['subcontractor', 'secondary'],
    ['other', 'default'],
  ] as const)(
    'maps %s expenses to the %s badge variant',
    (category, variant) => {
      expect(EXPENSE_CATEGORY_VARIANT[category]).toBe(variant)
    },
  )

  it('gives each backend category its own variant — no two collapse', () => {
    const variants = Object.values(EXPENSE_CATEGORY_VARIANT)
    expect(new Set(variants).size).toBe(variants.length)
  })

  it('has no entry for a category the backend does not serve', () => {
    expect(EXPENSE_CATEGORY_VARIANT['travel']).toBeUndefined()
  })
})
