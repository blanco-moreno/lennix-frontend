import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  cssVarsPrefix: 'lennix',
  globalCss: {
    html: {
      // 16, not 14: Chakra tokenizes in rem, so a 14px root ran the whole UI
      // at 87.5% of its designed size — the "everything feels small" bug.
      fontSize: '16px',
    },
    body: {
      bg: 'bg.canvas',
      color: 'fg.default',
    },
  },
  theme: {
    keyframes: {
      'indeterminate-bar': {
        '0%': { transform: 'translateX(-110%)' },
        '100%': { transform: 'translateX(275%)' },
      },
      /**
       * The boot-to-login handoff. LoadingScreen and the auth screen share the
       * same navy and the same timeline ground, so only the content needs to
       * arrive — without this it cut hard on reload.
       */
      'fade-rise': {
        '0%': { opacity: 0, transform: 'translateY(0.75rem)' },
        '100%': { opacity: 1, transform: 'none' },
      },
      // The skeleton sweep. Moves the gradient, not the box, so it costs one
      // composited property and never reflows the placeholder.
      shimmer: {
        '0%': { backgroundPosition: '200% 0' },
        '100%': { backgroundPosition: '-200% 0' },
      },
    },
    tokens: {
      colors: {
        brand: {
          50: { value: '#eef1f6' },
          100: { value: '#d5dce8' },
          200: { value: '#aab8d0' },
          300: { value: '#7f94b9' },
          400: { value: '#5470a1' },
          500: { value: '#2f4c7d' },
          600: { value: '#24395e' },
          700: { value: '#1b2c49' },
          800: { value: '#14213d' },
          900: { value: '#0e1729' },
          950: { value: '#080d18' },
        },
        accent: {
          50: { value: '#fff8eb' },
          100: { value: '#feecc7' },
          200: { value: '#fdd88a' },
          300: { value: '#fcc04d' },
          400: { value: '#fcae24' },
          500: { value: '#fca311' },
          600: { value: '#e08505' },
          700: { value: '#ba6108' },
          800: { value: '#974b0e' },
          900: { value: '#7c3e0f' },
          950: { value: '#482003' },
        },
      },
    },
    semanticTokens: {
      colors: {
        /**
         * Dark values follow the v2 mockup: deep navy-tinted ground
         * (#10141F/#151A26), raised surfaces #1D2432, borders #333C4E, warm
         * ink #E7E4DE. The amber accent and the semantic mid-tones read on
         * both grounds and stay single-valued.
         */
        bg: {
          canvas: { value: { base: '#ffffff', _dark: '#10141f' } },
          subtle: { value: { base: '{colors.gray.50}', _dark: '#1a2130' } },
          muted: { value: { base: '{colors.gray.100}', _dark: '#232b3b' } },
          panel: { value: { base: '#ffffff', _dark: '#1d2432' } },
          card: { value: { base: '#ffffff', _dark: '#1d2432' } },
          popover: { value: { base: '#ffffff', _dark: '#232b3b' } },
          input: { value: { base: '{colors.gray.50}', _dark: '#252d3d' } },
          switch: { value: { base: '{colors.gray.300}', _dark: '#3b455a' } },
        },
        fg: {
          default: { value: { base: '{colors.brand.800}', _dark: '#e7e4de' } },
          muted: { value: { base: '{colors.gray.500}', _dark: '#9aa3b5' } },
          subtle: { value: { base: '{colors.gray.400}', _dark: '#6e7a90' } },
          inverted: { value: { base: '#ffffff', _dark: '#10141f' } },
        },
        border: {
          DEFAULT: { value: { base: '{colors.gray.200}', _dark: '#333c4e' } },
          muted: { value: { base: '{colors.gray.200}', _dark: '#2a3347' } },
          input: { value: { base: 'transparent', _dark: '#3b455a' } },
        },
        /**
         * `primary` is the INK role — headings, emphasis text, the default
         * badge. It flips to a light ink in dark. Surfaces that want the
         * brand navy in BOTH modes (sidebar, login, 404) use `sidebar` —
         * never `primary`, which would invert under them.
         */
        primary: {
          DEFAULT: { value: { base: '{colors.brand.800}', _dark: '#d7dde8' } },
          fg: { value: { base: '#ffffff', _dark: '#151a26' } },
        },
        secondary: {
          DEFAULT: { value: { base: '{colors.gray.200}', _dark: '#2a3347' } },
          fg: { value: { base: '{colors.brand.800}', _dark: '#d7dde8' } },
        },
        brand: {
          contrast: { value: '#ffffff' },
          subtle: { value: '{colors.brand.50}' },
          muted: { value: '{colors.brand.100}' },
          emphasized: { value: '{colors.brand.200}' },
          solid: { value: '{colors.brand.800}' },
          focusRing: { value: '{colors.accent.500}' },
          border: { value: '{colors.brand.300}' },
        },
        accent: {
          DEFAULT: { value: '{colors.accent.500}' },
          /**
           * Dark ink, not white. White on the brand amber measures 2.02:1 —
           * a WCAG failure on the app's primary action. Navy ink on the same
           * fill measures 8.85:1 and keeps the amber exactly as it is.
           */
          fg: { value: '{colors.brand.900}' },
          contrast: { value: '{colors.brand.900}' },
          subtle: { value: '{colors.accent.50}' },
          muted: { value: '{colors.accent.100}' },
          emphasized: { value: '{colors.accent.200}' },
          solid: { value: '{colors.accent.500}' },
          focusRing: { value: '{colors.accent.500}' },
          border: { value: '{colors.accent.300}' },
        },
        complementary: {
          DEFAULT: { value: '{colors.accent.500}' },
          /** See `accent.fg`: white on this amber is 2.02:1. */
          fg: { value: '{colors.brand.900}' },
        },
        /**
         * The four red roles, split by meaning:
         * `critical` schedule/time danger · `overBudget` money danger ·
         * `destructive` destroying actions · `error` validation/load failures.
         */
        critical: {
          DEFAULT: { value: '{colors.red.600}' },
          fg: { value: '#ffffff' },
        },
        overBudget: {
          DEFAULT: { value: '{colors.red.600}' },
          fg: { value: '#ffffff' },
        },
        destructive: {
          DEFAULT: { value: '{colors.red.600}' },
          fg: { value: '#ffffff' },
        },
        error: {
          DEFAULT: { value: '{colors.red.600}' },
          fg: { value: '#ffffff' },
        },
        success: {
          DEFAULT: { value: '{colors.green.600}' },
          fg: { value: '#ffffff' },
        },
        /**
         * Time lost. **Red** — the fifth member of the red family, kept as its
         * own role for the same reason as the other four: the call sites say
         * what they mean, so the hue can move again without hunting them.
         *
         * It was amber until the colorimetry pass. Amber reads as "careful",
         * and a slip is not a caution: the days are already gone. Amber now
         * means only what can still be prevented — blocked, at risk — and the
         * Gantt's slipped segment moved with the token.
         */
        delayed: {
          DEFAULT: { value: '{colors.red.600}' },
          fg: { value: '#ffffff' },
        },
        /**
         * Must stay visually distinct from `accent`/`priority` orange: warning
         * belongs with danger, sitting between the brand amber and `destructive` red.
         */
        warning: {
          DEFAULT: { value: '{colors.orange.500}' },
          fg: { value: '#ffffff' },
        },
        info: {
          DEFAULT: { value: '{colors.blue.500}' },
          fg: { value: '#ffffff' },
        },
        priority: {
          critical: {
            DEFAULT: { value: '{colors.red.600}' },
            fg: { value: '#ffffff' },
          },
          high: {
            DEFAULT: { value: '{colors.red.600}' },
            fg: { value: '#ffffff' },
          },
          medium: {
            DEFAULT: { value: '{colors.orange.400}' },
            fg: { value: '#ffffff' },
          },
          low: {
            DEFAULT: { value: '{colors.blue.500}' },
            fg: { value: '#ffffff' },
          },
        },
        status: {
          active: {
            DEFAULT: { value: '{colors.green.600}' },
            fg: { value: '#ffffff' },
          },
          monitoring: {
            DEFAULT: { value: '{colors.purple.500}' },
            fg: { value: '#ffffff' },
          },
          contingency: {
            DEFAULT: { value: '{colors.accent.500}' },
            fg: { value: '{colors.brand.900}' },
          },
        },
        sidebar: {
          DEFAULT: { value: { base: '{colors.brand.800}', _dark: '#10182a' } },
          fg: { value: '#ffffff' },
          primary: {
            DEFAULT: { value: '{colors.accent.500}' },
            fg: { value: '{colors.brand.900}' },
          },
          accent: {
            DEFAULT: { value: '{colors.gray.800}' },
            fg: { value: '{colors.gray.200}' },
          },
          border: { value: '{colors.gray.700}' },
          ring: { value: '{colors.accent.500}' },
        },
        chart: {
          1: { value: '{colors.accent.500}' },
          2: {
            value: { base: '{colors.brand.800}', _dark: '{colors.brand.300}' },
          },
          3: { value: '{colors.gray.500}' },
          4: { value: '{colors.orange.400}' },
          5: {
            value: { base: '{colors.gray.700}', _dark: '{colors.gray.400}' },
          },
        },
        /**
         * The Gantt's own roles. The SVG reads them as CSS variables
         * (`var(--lennix-colors-gantt-*)`, see `schedule-palette.ts`), which
         * is what lets a chart drawn in raw attributes flip with the mode.
         */
        gantt: {
          task: {
            value: { base: '{colors.brand.600}', _dark: '{colors.brand.300}' },
          },
          subtask: {
            value: { base: '{colors.brand.400}', _dark: '{colors.brand.200}' },
          },
          critical: {
            value: { base: '{colors.red.600}', _dark: '{colors.red.500}' },
          },
          /** Slipped time — red, tracking the `delayed` semantic token. It is
           * deliberately the same red as `critical`: on a bar chart, lost days
           * and the critical path are the same order of urgency, and the mark
           * beside the row already says which is which. */
          delay: {
            value: { base: '{colors.red.600}', _dark: '{colors.red.500}' },
          },
          link: { value: '{colors.accent.500}' },
          broken: {
            value: { base: '{colors.red.600}', _dark: '{colors.red.500}' },
          },
          'blocked-stroke': {
            value: { base: '{colors.brand.700}', _dark: '{colors.brand.100}' },
          },
          progress: { value: { base: '#ffffff', _dark: '#10141f' } },
          'row-selected': {
            value: { base: '{colors.brand.100}', _dark: '#2a3347' },
          },
          'row-selected-hover': {
            value: { base: '{colors.brand.200}', _dark: '#34405c' },
          },
          'row-hovered': {
            value: { base: '{colors.brand.50}', _dark: '#232b3b' },
          },
          'selected-stroke': {
            value: { base: '{colors.brand.800}', _dark: '{colors.brand.100}' },
          },
          /** Saturday and Sunday, as a band behind the bars. Quieter than the
           *  hovered row: a weekend is context, and it must never be mistaken
           *  for a row the pointer is on. */
          weekend: { value: { base: '{colors.gray.100}', _dark: '#1a2030' } },
          /**
           * Today. Deliberately neutral and drawn dashed: red is the critical
           * path and slipped time, amber is the linking gesture, and a
           * reference line that borrowed either would read as data about the
           * schedule rather than as where the calendar currently stands.
           */
          today: {
            value: { base: '{colors.gray.700}', _dark: '{colors.gray.300}' },
          },
        },
        ring: { value: '{colors.accent.500}' },
      },
      /**
       * The layout scale. Every padding and gap that means something — a page
       * gutter, a card's inside, the rhythm between sections — names it here
       * instead of picking a number at the call site. The compression for
       * small screens lives *inside* the token, so a consumer writes
       * `p="card"` once and never repeats a `{ base, md }` pair.
       */
      spacing: {
        /** Page gutter. Was three rival families (4/6/8, 4/8/10, flat 6). */
        gutter: { value: { base: '1rem', md: '1.5rem', xl: '2rem' } },
        gutterY: { value: { base: '1.5rem', lg: '2rem' } },
        /** Inside a card. */
        card: { value: { base: '1rem', md: '1.5rem' } },
        /** Inside a compact card — stat tiles, meters, inline status. */
        cardSm: { value: { base: '0.75rem', md: '1rem' } },
        /** The row gutter and the small internal step. */
        tight: { value: '0.75rem' },
        /**
         * Between one form field and the next. Flat, unlike the rest: a field
         * is a label over a control, and the pair reads as one thing at every
         * width — letting it breathe on a desktop only pulls the label away
         * from what it labels. Pairs with `FormField`'s own inner gap.
         */
        field: { value: '1rem' },
        /** Between sections of one card or view. */
        section: { value: { base: '1rem', md: '1.5rem' } },
        /** Between blocks of layout — card to card, slice to slice. */
        block: { value: { base: '1.5rem', md: '2rem' } },
      },
      sizes: {
        /**
         * The touch floor. 44px is the WCAG 2.5.5 / HIG minimum, and this app
         * is operated on a tablet, on site, sometimes with gloves — so it is
         * a floor for every interactive row and control, not a suggestion.
         */
        touch: { value: '2.75rem' },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
