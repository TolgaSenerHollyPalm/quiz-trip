import { SunIcon } from 'kitshelf-ui/ui/icons.tsx'
import {
  BagIcon,
  BedIcon,
  ChatIcon,
  ClockIcon,
  ForkKnifeIcon,
  MedicalIcon,
  PassportIcon,
  PinIcon,
  SeatIcon,
} from '../ui/icons.tsx'
import TransportIcon from '../ui/TransportIcon.tsx'
import type { TopicIcon as TopicIconName } from './content.ts'

/** A travel English topic's icon, by the name the content gives it. */
export default function TopicIcon({ icon, size = 22 }: { icon: TopicIconName; size?: number }) {
  switch (icon) {
    case 'chat':
      return <ChatIcon size={size} />
    case 'plane':
      return <TransportIcon transport="plane" size={size} decorative />
    case 'seat':
      return <SeatIcon size={size} />
    case 'passport':
      return <PassportIcon size={size} />
    case 'bed':
      return <BedIcon size={size} />
    case 'car':
      return <TransportIcon transport="car" size={size} decorative />
    case 'fork':
      return <ForkKnifeIcon size={size} />
    case 'bag':
      return <BagIcon size={size} />
    case 'pin':
      return <PinIcon size={size} />
    case 'sun':
      return <SunIcon size={size} />
    case 'clock':
      return <ClockIcon size={size} />
    case 'cross':
      return <MedicalIcon size={size} />
  }
}
