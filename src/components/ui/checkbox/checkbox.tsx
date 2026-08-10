import { Checkbox as ChakraCheckbox } from '@chakra-ui/react'
import { CheckIcon } from 'lucide-react'

export interface CheckboxProps extends Omit<
  ChakraCheckbox.RootProps,
  'onCheckedChange'
> {
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({ onCheckedChange, ...props }: CheckboxProps) {
  return (
    <ChakraCheckbox.Root
      colorPalette="brand"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        w: { base: 'touch', lg: '100%' },
        h: { base: 'touch', lg: '100%' },
      }}
      onCheckedChange={(e) => onCheckedChange?.(e.checked === true)}
      {...props}
    >
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control>
        <ChakraCheckbox.Indicator>
          <CheckIcon />
        </ChakraCheckbox.Indicator>
      </ChakraCheckbox.Control>
    </ChakraCheckbox.Root>
  )
}

export { Checkbox }
