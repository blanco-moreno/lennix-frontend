/**
 * ESLint Flat Configuration
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 *
 * Migrated from .eslintrc.cjs to ESLint v9 flat config format.
 */
import tsPrefixer from 'eslint-config-ts-prefixer'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  // ─────────────────────────────────────────────────────────────
  // Global ignores (migrated from .eslintignore)
  // ─────────────────────────────────────────────────────────────
  {
    ignores: [
      '.vscode/**',
      '.github/**',
      'public/**',
      'lang/**',
      // Note: node_modules, build, dist, .git, .idea are already ignored by ts-prefixer
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Base configuration from eslint-config-ts-prefixer
  // Includes: TypeScript parser/plugin, eslint-plugin-import, projectService
  // ─────────────────────────────────────────────────────────────
  ...tsPrefixer,

  // ─────────────────────────────────────────────────────────────
  // Import resolver configuration for TypeScript path mapping
  // ─────────────────────────────────────────────────────────────
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Accessibility rules (jsx-a11y)
  // ─────────────────────────────────────────────────────────────
  jsxA11y.flatConfigs.recommended,

  // ─────────────────────────────────────────────────────────────
  // React Hooks rules
  // ─────────────────────────────────────────────────────────────
  reactHooks.configs.flat['recommended-latest'],

  // ─────────────────────────────────────────────────────────────
  // Playwright fixtures: `use` is the runner's callback, not a React hook,
  // and `async ({}, use)` is how a fixture that depends on nothing is written.
  // ─────────────────────────────────────────────────────────────
  {
    files: ['e2e/**/*.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'no-empty-pattern': 'off',
    },
  },
]
