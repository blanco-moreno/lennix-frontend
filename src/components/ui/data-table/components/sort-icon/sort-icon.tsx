import { chakra } from '@chakra-ui/react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

const ArrowUpIcon = chakra(ArrowUp)
const ArrowDownIcon = chakra(ArrowDown)
const ArrowUpDownIcon = chakra(ArrowUpDown)

function SortIcon({ direction }: { direction: false | 'asc' | 'desc' }) {
  if (direction === 'asc')
    return <ArrowUpIcon boxSize="3.5" color="fg.default" />
  if (direction === 'desc')
    return <ArrowDownIcon boxSize="3.5" color="fg.default" />
  return <ArrowUpDownIcon boxSize="3.5" color="fg.muted" />
}

export { SortIcon }
