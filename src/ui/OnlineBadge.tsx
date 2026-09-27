import Chip from './Chip.tsx'
import { useOnline } from './useOnline.ts'

export default function OnlineBadge() {
  return useOnline() ? <Chip tone="online">Çevrimiçi</Chip> : <Chip tone="quiet">Çevrimdışı</Chip>
}
