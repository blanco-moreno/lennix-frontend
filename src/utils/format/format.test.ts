import {
  clampPercentage,
  currencyFractionDigits,
  currencyLocale,
  toProjectCurrency,
  daysUntil,
  toISODay,
  formatMoney,
  formatPercent,
  parseDateTime,
  parseDay,
  parseMoney,
  serializeMoneyForApi,
  subtractMoney,
} from './format'

describe('money', () => {
  it('parses backend money strings to major units', () => {
    expect(parseMoney('900.00')).toBe(900)
    expect(parseMoney('300.50')).toBe(300.5)
    expect(parseMoney(null)).toBe(0)
    expect(parseMoney(undefined)).toBe(0)
    expect(parseMoney('')).toBe(0)
    expect(parseMoney('not-a-number')).toBe(0)
  })

  it('round-trips a money string through parse → serialize', () => {
    for (const value of ['0.00', '900.00', '300.50', '9999999999.99', '0.10']) {
      expect(serializeMoneyForApi(parseMoney(value))).toBe(value)
    }
  })

  it('serializes to exactly 2 decimals with no float artifacts', () => {
    expect(serializeMoneyForApi(900)).toBe('900.00')
    expect(serializeMoneyForApi(0.1)).toBe('0.10')
    // 0.1 + 0.2 would be 0.30000000000000004 with naive float math
    expect(serializeMoneyForApi(0.30000000000000004)).toBe('0.30')
  })

  it('subtracts without accumulating float error', () => {
    expect(subtractMoney('900.00', '300.30')).toBe(599.7)
    expect(subtractMoney(0.3, 0.1)).toBe(0.2)
  })

  it('formats money as USD', () => {
    expect(formatMoney('1234.56')).toBe('$1,234.56')
    expect(formatMoney(900)).toBe('$900.00')
    expect(formatMoney(null)).toBe('$0.00')
  })
})

describe('dates', () => {
  it('parses YYYY-MM-DD as a local calendar date (no TZ shift)', () => {
    const d = parseDay('2026-07-18')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(6) // July, 0-indexed
    expect(d.getDate()).toBe(18)
  })

  it('toISODay round-trips a date-only string without an off-by-one shift', () => {
    expect(toISODay('2026-07-18')).toBe('2026-07-18')
    expect(toISODay('2026-01-01')).toBe('2026-01-01')
    expect(toISODay('2026-12-31')).toBe('2026-12-31')
  })

  it('treats a naive datetime (no offset) as UTC', () => {
    const naive = parseDateTime('2026-07-18T12:00:00')
    const aware = parseDateTime('2026-07-18T12:00:00+00:00')
    const zulu = parseDateTime('2026-07-18T12:00:00Z')
    expect(naive.getTime()).toBe(aware.getTime())
    expect(naive.getTime()).toBe(zulu.getTime())
    expect(naive.toISOString()).toBe('2026-07-18T12:00:00.000Z')
  })

  it('respects an explicit offset', () => {
    const offset = parseDateTime('2026-07-18T12:00:00+02:00')
    expect(offset.toISOString()).toBe('2026-07-18T10:00:00.000Z')
  })
})

describe('daysUntil', () => {
  const today = new Date(2026, 7, 3)

  it('counts calendar days ahead, behind and on the day itself', () => {
    expect(daysUntil('2026-09-15', today)).toBe(43)
    expect(daysUntil('2026-08-03', today)).toBe(0)
    expect(daysUntil('2026-07-22', today)).toBe(-12)
  })

  it('counts calendar days, not elapsed hours — tomorrow reads as 1 all day', () => {
    const lateInTheDay = new Date(2026, 7, 3, 23, 30)

    expect(daysUntil('2026-08-04', lateInTheDay)).toBe(1)
  })
})

describe('percent', () => {
  it('rounds unbounded backend percentage floats', () => {
    expect(formatPercent(66.66666666666667)).toBe('66.7%')
    expect(formatPercent(66.66666666666667, 0)).toBe('67%')
    expect(formatPercent(100)).toBe('100.0%')
    expect(formatPercent(Number.NaN)).toBe('—')
  })

  it('clamps percentages to 0–100', () => {
    expect(clampPercentage(-5)).toBe(0)
    expect(clampPercentage(150)).toBe(100)
    expect(clampPercentage(50)).toBe(50)
  })
})

describe('currencies (ISO 4217, BUD-10)', () => {
  it('writes each currency the way its market reads it', () => {
    expect(formatMoney(18682420, 'CLP')).toBe('$18.682.420')
    expect(formatMoney(18682420, 'USD')).toBe('$18,682,420.00')
    // The default is unchanged: what every project showed before.
    expect(formatMoney(1234.5)).toBe('$1,234.50')
  })

  it('takes the minor units from the code', () => {
    expect(currencyFractionDigits('CLP')).toBe(0)
    expect(currencyFractionDigits('USD')).toBe(2)
  })

  it('maps a currency to its market locale', () => {
    expect(currencyLocale('CLP')).toBe('es-CL')
    expect(currencyLocale('USD')).toBe('en-US')
    expect(currencyLocale('XXX')).toBe('en-US')
  })

  it('reads anything that is not a project currency as USD', () => {
    expect(toProjectCurrency('CLP')).toBe('CLP')
    expect(toProjectCurrency('clp')).toBe('USD')
    expect(toProjectCurrency(undefined)).toBe('USD')
    expect(toProjectCurrency('CLF')).toBe('USD')
  })
})
