import { Avatar as ChakraAvatar } from '@chakra-ui/react'

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export interface AvatarProps extends Omit<ChakraAvatar.RootProps, 'children'> {
  src?: string
  name: string
  fallbackProps?: ChakraAvatar.FallbackProps
}

function Avatar({ src, name, fallbackProps, ...props }: AvatarProps) {
  return (
    <ChakraAvatar.Root {...props}>
      {src && <ChakraAvatar.Image src={src} alt={name} />}
      <ChakraAvatar.Fallback {...fallbackProps}>
        {initials(name)}
      </ChakraAvatar.Fallback>
    </ChakraAvatar.Root>
  )
}

export { Avatar }
