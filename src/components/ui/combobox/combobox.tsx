import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import ReactSelect from 'react-select'

import { useDebouncedValue } from '@/hooks'
import {
  createSelectStyles,
  type SelectOption as ComboboxOption,
} from '@/theme/recipes/select.recipe'

import { comboboxMessages } from './combobox-messages'

export interface ComboboxProps<Option extends ComboboxOption = ComboboxOption> {
  value?: string
  onValueChange?: (value: string) => void
  options: Option[]
  /**
   * Draws the row inside the menu. The option keeps its own extra fields, so a
   * caller can hang dates, a status, or the reason a row is disabled off it and
   * render them here — as text, never as a tooltip: hover reaches neither a
   * touch screen nor a screen reader.
   */
  renderOption?: (option: Option) => ReactNode
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  size?: 'sm' | 'default'
  width?: string | number
  id?: string
  noOptionsMessage?: string
  /**
   * Server-side search. When set, the box stops filtering `options` locally:
   * the server may match on fields the label does not show.
   */
  onSearch?: (term: string) => void
  /**
   * What the user has typed, reported as they type. Unlike
   * {@link ComboboxProps.onSearch} this changes nothing: local filtering stays
   * on. For a caller that keeps part of its list folded away and wants a search
   * to reach into it.
   */
  onTermChange?: (term: string) => void
  /** A search is in flight. Ignored unless {@link ComboboxProps.onSearch} is set. */
  isLoading?: boolean
  loadingMessage?: string
}

function Combobox<Option extends ComboboxOption = ComboboxOption>({
  value,
  onValueChange,
  options,
  renderOption,
  placeholder,
  disabled,
  invalid,
  size,
  width,
  id,
  noOptionsMessage,
  onSearch,
  onTermChange,
  isLoading,
  loadingMessage,
}: ComboboxProps<Option>) {
  const intl = useIntl()
  const searchesTheServer = onSearch !== undefined

  const [term, setTerm] = useState('')
  const debouncedTerm = useDebouncedValue(term)

  // Held in a ref so the search effect depends on the term alone: an inline
  // arrow passed as `onSearch` changes identity on every render and would
  // re-fire the search on each one.
  const onSearchRef = useRef(onSearch)
  useEffect(() => {
    onSearchRef.current = onSearch
  })

  useEffect(() => {
    onSearchRef.current?.(debouncedTerm)
  }, [debouncedTerm])

  // react-select takes the selected *option*, not the id, so a value whose
  // option is absent from `options` renders blank. With server-side search
  // that is the ordinary case — type three letters and the project already
  // picked drops out of the results — so the last option that matched is kept.
  const [remembered, setRemembered] = useState<Option | null>(null)
  const matched = options.find((option) => option.value === value) ?? null
  if (
    matched &&
    (remembered?.value !== matched.value || remembered.label !== matched.label)
  ) {
    setRemembered(matched)
  }
  const selected = matched ?? (remembered?.value === value ? remembered : null)

  return (
    <ReactSelect<Option, false>
      unstyled
      classNamePrefix="select"
      styles={createSelectStyles<Option>({
        size,
        invalid,
        width,
        cursor: 'text',
      })}
      isClearable
      // Menu rows only. The same renderer in the control would put the option's
      // two-column layout inside a one-line box.
      formatOptionLabel={
        renderOption &&
        ((option, meta): ReactNode =>
          meta.context === 'menu' ? renderOption(option) : option.label)
      }
      inputId={id}
      aria-invalid={invalid || undefined}
      isDisabled={disabled}
      options={options}
      isOptionDisabled={(option) => option.disabled === true}
      value={selected}
      onChange={(option) => onValueChange?.(option?.value ?? '')}
      placeholder={placeholder ?? ''}
      isLoading={searchesTheServer ? isLoading : undefined}
      filterOption={searchesTheServer ? null : undefined}
      onInputChange={
        searchesTheServer || onTermChange
          ? (next, meta) => {
              if (meta.action === 'input-change') {
                setTerm(next)
                onTermChange?.(next)
                return
              }
              // react-select clears its own input on close and on blur without
              // reporting either as a change. Dropping the term with it is
              // what makes the next open show the full first page instead of
              // the results of a search the box no longer displays.
              if (
                meta.action === 'menu-close' ||
                meta.action === 'input-blur'
              ) {
                setTerm('')
                onTermChange?.('')
              }
            }
          : undefined
      }
      loadingMessage={() =>
        loadingMessage ?? intl.formatMessage(comboboxMessages.loading)
      }
      noOptionsMessage={() =>
        noOptionsMessage ?? intl.formatMessage(comboboxMessages.noOptions)
      }
    />
  )
}

export { Combobox }
