import { describe, expect, it } from 'vitest'
import { ENGLISH_TOPICS, findItem, findTopic, hasGap, PHRASE_COUNT, TOPIC_ICONS, WORD_COUNT } from './content.ts'

const TONES = ['teal', 'coral', 'amber', 'neutral', 'accent']
const items = ENGLISH_TOPICS.flatMap((topic) => [...topic.phrases, ...topic.words])

describe('travel English content', () => {
  it('has 12 topics, 162 phrases and 99 words', () => {
    expect(ENGLISH_TOPICS).toHaveLength(12)
    expect(PHRASE_COUNT).toBe(162)
    expect(WORD_COUNT).toBe(99)
  })

  it('uses every id once across topics, phrases and words, and none is empty', () => {
    const ids = [...ENGLISH_TOPICS.map((topic) => topic.id), ...items.map((item) => item.id)]
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id.trim()).not.toBe('')
  })

  it('leaves no title, Turkish, English or note empty', () => {
    for (const topic of ENGLISH_TOPICS) expect(topic.title.trim()).not.toBe('')
    for (const item of items) {
      expect(item.tr.trim(), item.id).not.toBe('')
      expect(item.en.trim(), item.id).not.toBe('')
      if (item.note !== undefined) expect(item.note.trim(), item.id).not.toBe('')
    }
  })

  it('gives every topic a known tone and icon', () => {
    for (const topic of ENGLISH_TOPICS) {
      expect(TONES, topic.id).toContain(topic.tone)
      expect(TOPIC_ICONS, topic.id).toContain(topic.icon)
    }
  })

  it('has at least 4 phrases without a gap in every topic, enough for a quiz question', () => {
    for (const topic of ENGLISH_TOPICS) {
      expect(topic.phrases.filter((phrase) => !hasGap(phrase)).length, topic.id).toBeGreaterThanOrEqual(4)
    }
  })

  it('finds topics and items by id', () => {
    expect(findTopic('restaurant')?.title).toBeTruthy()
    expect(findItem('restaurant-p12')).toMatchObject({ kind: 'phrase', topic: { id: 'restaurant' } })
    expect(findItem('nope')).toBeUndefined()
  })
})
