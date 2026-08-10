import type { StylesConfig } from 'react-select'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectStyleOptions {
  size?: 'sm' | 'default'
  invalid?: boolean
  width?: string | number
  /** `pointer` for a plain select, `text` when the control is searchable. */
  cursor?: 'pointer' | 'text'
}

const token = (name: string) => `var(--lennix-${name})`

const alpha = (name: string, percent: number) =>
  `color-mix(in srgb, ${token(name)} ${percent}%, transparent)`

export function createSelectStyles<Option extends SelectOption>({
  size = 'default',
  invalid = false,
  width = '100%',
  cursor = 'pointer',
}: SelectStyleOptions): StylesConfig<Option, false> {
  const ring = invalid ? 'colors-error' : 'colors-ring'

  return {
    container: (base) => ({ ...base, width }),
    control: (base, state) => ({
      ...base,
      minHeight: token(size === 'sm' ? 'sizes-9' : 'sizes-11'),
      padding: `0 ${token('spacing-3')}`,
      borderRadius: token('radii-md'),
      border: `1px solid ${token(invalid ? 'colors-error' : 'colors-border-input')}`,
      backgroundColor: token('colors-bg-input'),
      color: token('colors-fg-default'),
      fontSize: token('font-sizes-sm'),
      cursor,
      transition: 'border-color 150ms, box-shadow 150ms',
      ...(state.isFocused && {
        borderColor: token(ring),
        boxShadow: `0 0 0 3px ${alpha(ring, invalid ? 20 : 50)}`,
      }),
      ...(state.isDisabled && { opacity: 0.5, cursor: 'not-allowed' }),
    }),
    placeholder: (base) => ({ ...base, color: token('colors-fg-muted') }),
    singleValue: (base) => ({ ...base, color: token('colors-fg-default') }),
    input: (base) => ({ ...base, color: token('colors-fg-default') }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
      ...base,
      color: token('colors-fg-default'),
      opacity: 0.5,
    }),
    clearIndicator: (base) => ({
      ...base,
      color: token('colors-fg-muted'),
      cursor: 'pointer',
      paddingRight: token('spacing-1'),
    }),
    menu: (base) => ({
      ...base,
      marginTop: token('spacing-1'),
      padding: token('spacing-1'),
      borderRadius: token('radii-l2'),
      backgroundColor: token('colors-bg-popover'),
      boxShadow: token('shadows-md'),
      fontSize: token('font-sizes-sm'),
      zIndex: 1500,
    }),
    menuList: (base) => ({ ...base, maxHeight: token('sizes-96') }),
    option: (base, state) => ({
      ...base,
      padding: `0.375rem ${token('spacing-2')}`,
      borderRadius: token('radii-l1'),
      color: token('colors-fg-default'),
      cursor: 'pointer',
      backgroundColor: state.isFocused
        ? alpha('colors-bg-emphasized', 60)
        : 'transparent',
      fontWeight: state.isSelected ? 500 : 400,
      // Dimmed, not faded out: a disabled row here carries the reason it is
      // disabled, and that sentence has to stay readable.
      ...(state.isDisabled && { opacity: 0.75, cursor: 'not-allowed' }),
    }),
    noOptionsMessage: (base) => ({
      ...base,
      padding: `0.375rem ${token('spacing-2')}`,
      color: token('colors-fg-muted'),
      textAlign: 'start',
    }),
  }
}
