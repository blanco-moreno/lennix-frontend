import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { Then } from '../support/fixtures'

/**
 * One axe pass over the screen the scenario reached. Static lint (`jsx-a11y`)
 * cannot see contrast, focus order or the live DOM; this can, once per feature
 * on its main screen. Critical impacts fail the run; serious ones are attached
 * to the report so they are read, not lost — a contrast decision belongs to the
 * tone system, not to whichever scenario tripped it.
 */
Then(
  'the screen has no critical accessibility violations',
  async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const describe = (impact: string) =>
      violations
        .filter((v) => v.impact === impact)
        .map(
          (v) =>
            `${v.id}: ${v.nodes.map((n) => `${String(n.target)} ${n.html.slice(0, 120)}`).join(' | ')}`,
        )
    const serious = describe('serious')
    if (serious.length > 0) {
      test.info().annotations.push({
        type: 'a11y-serious',
        description: serious.join('\n'),
      })
    }
    expect(describe('critical')).toEqual([])
  },
)
