import {
  deltaLabel,
  formatAmount,
  snapshotCurrency,
  snapshotName,
} from './approval-format'

describe('snapshotName', () => {
  it('reads the name out of the state snapshot', () => {
    expect(snapshotName({ name: 'Torre Norte' })).toBe('Torre Norte')
  })

  it('renders a dash instead of trusting a missing or empty name', () => {
    expect(snapshotName({})).toBe('—')
    expect(snapshotName({ name: '' })).toBe('—')
    expect(snapshotName({ name: 42 })).toBe('—')
  })
})

describe('formatAmount', () => {
  it('formats a wire decimal as money', () => {
    expect(formatAmount('150000.00', '')).toMatch(/150[.,]000/)
  })

  it('falls back when there was no previous amount', () => {
    expect(formatAmount(null, 'No previous budget')).toBe('No previous budget')
  })
})

describe('deltaLabel', () => {
  it('signs an increase explicitly', () => {
    expect(deltaLabel('120000.00', '150000.00')).toMatch(/^\+/)
    expect(deltaLabel('120000.00', '150000.00')).toMatch(/30[.,]000/)
  })

  it('leaves the minus to the formatter on a decrease', () => {
    expect(deltaLabel('150000.00', '120000.00')).not.toMatch(/^\+/)
    expect(deltaLabel('150000.00', '120000.00')).toMatch(/30[.,]000/)
  })

  it('says nothing on a first budget — there is no delta from nothing', () => {
    expect(deltaLabel(null, '150000.00')).toBe('')
  })
})

describe('snapshotCurrency', () => {
  it('reads the currency the request was typed in (BUD-10)', () => {
    expect(snapshotCurrency({ currency: 'CLP' })).toBe('CLP')
  })

  it('reads a request from before the field as USD', () => {
    expect(snapshotCurrency({})).toBe('USD')
  })

  it('formats the amounts in that currency', () => {
    expect(formatAmount('1500000.00', '', 'CLP')).toBe('$1.500.000')
    expect(deltaLabel('1000000.00', '1500000.00', 'CLP')).toBe('+$500.000')
  })
})
