import { INDIRECT_CATEGORIES } from '@/types'

import enMessages from '../../../lang/en.json'
import esMessages from '../../../lang/es.json'
import ptMessages from '../../../lang/pt-BR.json'

import { indirectCategoryMessages } from './indirect-category-messages'

describe('indirect category labels', () => {
  it('names every overhead line the backend can send, in every bundle', () => {
    for (const category of INDIRECT_CATEGORIES) {
      const { id } = indirectCategoryMessages[category]
      for (const bundle of [enMessages, esMessages, ptMessages]) {
        expect((bundle as Record<string, string>)[id]).toBeTruthy()
      }
    }
  })
})
