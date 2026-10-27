import { describe, expect, it } from 'vitest'
import { moveAmong } from './order.ts'

// A list as stored: open and ticked items mixed, as the player ticked them.
const items = [
  { id: 'a', done: false },
  { id: 'x', done: true },
  { id: 'b', done: false },
  { id: 'c', done: false },
  { id: 'y', done: true },
  { id: 'd', done: false },
]
const open = ['a', 'b', 'c', 'd']
const ids = (list: { id: string }[]) => list.map((item) => item.id).join('')

describe('moveAmong', () => {
  it('moves among the shown items and leaves the hidden ones where they were', () => {
    expect(ids(moveAmong(items, open, 0, 2))).toBe('bxcayd')
    expect(ids(moveAmong(items, open, 3, 0))).toBe('dxabyc')
  })

  it('changes nothing for a move to the same place or an id it does not have', () => {
    expect(ids(moveAmong(items, open, 1, 1))).toBe('axbcyd')
    expect(ids(moveAmong(items, ['a', 'zz'], 0, 1))).toBe('axbcyd')
  })

  it('keeps every item exactly once', () => {
    const moved = moveAmong(items, open, 1, 3)
    expect([...moved].map((item) => item.id).sort()).toEqual(['a', 'b', 'c', 'd', 'x', 'y'])
  })
})
