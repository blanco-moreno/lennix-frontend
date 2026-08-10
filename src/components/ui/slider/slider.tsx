import { Slider as ChakraSlider } from '@chakra-ui/react'
import * as React from 'react'

export interface SliderProps extends Omit<
  ChakraSlider.RootProps,
  'onValueChange'
> {
  onValueChange?: (value: number[]) => void
}

function Slider({
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  ...props
}: SliderProps) {
  // Thumb count follows the controlled/uncontrolled value. When neither is
  // given, render a SINGLE thumb (at `min`) — a `[min, max]` fallback would
  // render two thumbs for every plain single-value slider.
  const values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min],
    [value, defaultValue, min],
  )

  return (
    <ChakraSlider.Root
      colorPalette="brand"
      width="full"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      onValueChange={(e) => onValueChange?.(e.value)}
      {...props}
    >
      <ChakraSlider.Control>
        <ChakraSlider.Track>
          <ChakraSlider.Range />
        </ChakraSlider.Track>
        {values.map((_, index) => (
          <ChakraSlider.Thumb index={index} key={index}>
            <ChakraSlider.HiddenInput />
          </ChakraSlider.Thumb>
        ))}
      </ChakraSlider.Control>
    </ChakraSlider.Root>
  )
}

export { Slider }
