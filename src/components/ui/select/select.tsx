import ReactSelect from 'react-select'

import {
  createSelectStyles,
  type SelectOption,
} from '@/theme/recipes/select.recipe'

export type SimpleSelectOption = SelectOption

export interface SimpleSelectProps {
  value?: string
  onChange?: (value: string) => void
  options: SimpleSelectOption[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  size?: 'sm' | 'default'
  width?: string | number
  id?: string
  /** Name for a select whose visible label is not bound to it by `id`. */
  'aria-label'?: string
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  invalid,
  size,
  width,
  id,
  'aria-label': ariaLabel,
}: SimpleSelectProps) {
  return (
    <ReactSelect<SimpleSelectOption, false>
      unstyled
      classNamePrefix="select"
      styles={createSelectStyles<SimpleSelectOption>({ size, invalid, width })}
      isSearchable={false}
      inputId={id}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      isDisabled={disabled}
      options={options}
      isOptionDisabled={(option) => option.disabled === true}
      value={options.find((option) => option.value === value) ?? null}
      onChange={(option) => onChange?.(option?.value ?? '')}
      placeholder={placeholder ?? ''}
    />
  )
}

export { Select }
