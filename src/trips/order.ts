import { moveItem } from 'kitshelf-ui/ui/sortable.ts'

/**
 * Moves one of the items a list shows to another shown place. The items it does not show (ticked ones, the other
 * tab's) keep their places in the stored list.
 */
export function moveAmong<T extends { id: string }>(items: readonly T[], shown: readonly string[], from: number, to: number): T[] {
  const slots = shown.map((id) => items.findIndex((item) => item.id === id))
  if (slots.some((slot) => slot < 0)) return [...items]
  const order = moveItem(shown, from, to)
  const result = [...items]
  slots.forEach((slot, place) => {
    result[slot] = items[slots[shown.indexOf(order[place])]]
  })
  return result
}
