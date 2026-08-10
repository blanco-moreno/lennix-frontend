import { normalizeName, similarity } from './text-match'

describe('normalizeName', () => {
  it('erases everything two spellings of the same name disagree on', () => {
    expect(normalizeName('  HORMIGÓN Armado ')).toBe('hormigon armado')
    expect(normalizeName('1.2 Instalación_de-faenas')).toBe(
      '1 2 instalacion de faenas',
    )
  })

  it('leaves nothing behind for a name made only of punctuation', () => {
    expect(normalizeName('— · —')).toBe('')
  })
})

describe('similarity', () => {
  it('scores the same name 1, however it is written', () => {
    expect(similarity('EXCAVACIÓN MASIVA', 'excavacion masiva')).toBe(1)
  })

  it('survives the typo an imported file actually contains', () => {
    expect(similarity('Excavacion masva', 'Excavación masiva')).toBeGreaterThan(
      0.7,
    )
  })

  it('does not pretend two unrelated rows are the same', () => {
    expect(similarity('Cierre perimetral', 'Cubierta')).toBeLessThan(0.34)
  })

  it('scores an empty name 0 instead of dividing by nothing', () => {
    expect(similarity('', 'Cierre perimetral')).toBe(0)
  })
})
