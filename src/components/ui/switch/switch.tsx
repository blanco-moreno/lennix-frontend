import { Switch as ChakraSwitch } from '@chakra-ui/react'

export interface SwitchProps extends Omit<
  ChakraSwitch.RootProps,
  'onCheckedChange'
> {
  onCheckedChange?: (checked: boolean) => void
}

function Switch({ onCheckedChange, ...props }: SwitchProps) {
  return (
    <ChakraSwitch.Root
      colorPalette="brand"
      onCheckedChange={(e) => onCheckedChange?.(e.checked === true)}
      {...props}
    >
      <ChakraSwitch.HiddenInput />
      <ChakraSwitch.Control>
        <ChakraSwitch.Thumb />
      </ChakraSwitch.Control>
    </ChakraSwitch.Root>
  )
}

export { Switch }
