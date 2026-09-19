import type { Route } from '../app/router.ts'
import { LinkButton } from './Button.tsx'
import Screen from './Screen.tsx'

interface MissingProps {
  message: string
  back: Route
}

/** Shown when an address points at something that no longer exists, e.g. a finished round. */
export default function Missing({ message, back }: MissingProps) {
  return (
    <Screen title="Bulunamadı" back={back}>
      <p>{message}</p>
      <LinkButton to={back}>Geri dön</LinkButton>
    </Screen>
  )
}
