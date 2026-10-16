import type { Tone } from 'kitshelf-ui/ui/tone.ts'
import data from './travel-english.json'

export const TOPIC_ICONS = ['chat', 'plane', 'seat', 'passport', 'bed', 'car', 'fork', 'bag', 'pin', 'sun', 'clock', 'cross'] as const
export type TopicIcon = (typeof TOPIC_ICONS)[number]

/** A phrase or a word: Turkish, its British English, and the American one in the note when they differ. */
export interface EnglishItem {
  id: string
  tr: string
  en: string // "…" marks a gap the speaker fills in
  note?: string
}

export interface EnglishTopic {
  id: string
  title: string
  icon: TopicIcon
  tone: Tone
  phrases: EnglishItem[]
  words: EnglishItem[]
}

export type EnglishKind = 'phrase' | 'word'

/** An item with the topic it belongs to, as screens list it. */
export interface FoundItem {
  item: EnglishItem
  topic: EnglishTopic
  kind: EnglishKind
}

// Ships inside the app, so it works offline from the first launch; the tests check the file's shape.
export const ENGLISH_TOPICS = data.topics as EnglishTopic[]

export const PHRASE_COUNT = ENGLISH_TOPICS.reduce((sum, topic) => sum + topic.phrases.length, 0)
export const WORD_COUNT = ENGLISH_TOPICS.reduce((sum, topic) => sum + topic.words.length, 0)

/** A phrase with a gap to fill in cannot be the right answer to a quiz question. */
export const hasGap = (item: EnglishItem) => item.en.includes('…') || item.tr.includes('…')

export const findTopic = (id: string): EnglishTopic | undefined => ENGLISH_TOPICS.find((topic) => topic.id === id)

const BY_ID = new Map<string, FoundItem>(
  ENGLISH_TOPICS.flatMap((topic) => [
    ...topic.phrases.map((item): [string, FoundItem] => [item.id, { item, topic, kind: 'phrase' }]),
    ...topic.words.map((item): [string, FoundItem] => [item.id, { item, topic, kind: 'word' }]),
  ]),
)

export const findItem = (id: string): FoundItem | undefined => BY_ID.get(id)
