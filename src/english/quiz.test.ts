import { describe, expect, it } from 'vitest'
import { makeQuestions, seededRng } from '../game/test-helpers.ts'
import { collectPacks, NO_PACKS, ownId } from '../packs/collection.ts'
import type { Pack } from '../packs/types.ts'
import { ENGLISH_TOPICS, findItem, hasGap } from './content.ts'
import { ENGLISH_CATEGORY, englishQuestions, quizCategoryLabel, withEnglish } from './quiz.ts'

const questions = englishQuestions(seededRng(11))
const byPhrase = (id: string) => questions.find((question) => question.id === `travel-english:${id}`)

const pack: Pack = {
  schemaVersion: 1,
  id: 'eg-sharm-el-sheikh',
  title: 'Mısır — Sharm el-Şeyh',
  country: 'EG',
  city: 'Sharm el-Şeyh',
  version: 1,
  updatedAt: '2026-10-17',
  questions: makeQuestions(5, 'history', 'easy'),
  predictionTemplates: [],
}

describe('englishQuestions', () => {
  it('asks one question per phrase without a gap', () => {
    expect(questions).toHaveLength(154)
    const gapped = ENGLISH_TOPICS.flatMap((topic) => topic.phrases).filter(hasGap)
    expect(gapped.length).toBeGreaterThan(0)
    for (const phrase of gapped) expect(byPhrase(phrase.id)).toBeUndefined()
  })

  it('qualifies ids with the travel English pack and puts every question in its one category', () => {
    for (const question of questions) {
      expect(question.id).toMatch(/^travel-english:[a-z]+-p\d+$/)
      expect(question.category).toBe('travel-english:english')
    }
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length)
  })

  it('offers four different options from the same topic, the right one at answerIndex', () => {
    for (const question of questions) {
      const found = findItem(ownId(question.id))!
      const topicEnglish = found.topic.phrases.filter((phrase) => !hasGap(phrase)).map((phrase) => phrase.en)
      expect(question.options).toHaveLength(4)
      expect(new Set(question.options).size).toBe(4)
      expect(question.options[question.answerIndex]).toBe(found.item.en)
      for (const option of question.options) expect(topicEnglish).toContain(option)
    }
  })

  it('takes the difficulty from the number of English words', () => {
    const count = (difficulty: string) => questions.filter((question) => question.difficulty === difficulty).length
    expect([count('easy'), count('medium'), count('hard')]).toEqual([68, 66, 20])
    expect(byPhrase('restaurant-p12')?.difficulty).toBe('medium') // "Could we have the bill, please?"
  })

  it('writes the question and the explanation as plain text, the note last', () => {
    expect(byPhrase('restaurant-p12')).toMatchObject({
      text: '“Hesabı alabilir miyiz?” İngilizce nasıl söylenir?',
      explanation: '“Hesabı alabilir miyiz?” → Could we have the bill, please? · ABD’de: check',
    })
    expect(byPhrase('basics-p01')?.explanation).toBe('“Merhaba.” → Hello.')
  })

  it('deals the same options for the same rng', () => {
    expect(englishQuestions(seededRng(11))).toEqual(questions)
  })
})

describe('withEnglish', () => {
  it('adds the questions and their group after the packs on a trip abroad', () => {
    const collection = collectPacks([pack])
    const result = withEnglish(collection, { country: 'EG' }, seededRng(1))
    expect(result.questions).toHaveLength(collection.questions.length + 154)
    expect(result.questions.slice(0, collection.questions.length)).toEqual(collection.questions)
    expect(result.categoryGroups).toEqual([
      ...collection.categoryGroups,
      {
        packId: 'travel-english',
        packTitle: 'Seyahat İngilizcesi',
        categories: [{ id: 'travel-english:english', label: 'İngilizce' }],
      },
    ])
    expect(result.packs).toEqual(collection.packs)
    expect(result.templates).toEqual(collection.templates)
  })

  it('adds nothing to a trip in Türkiye or without a country', () => {
    const collection = collectPacks([{ ...pack, id: 'tr-mardin', country: 'TR' }])
    expect(withEnglish(collection, { country: 'TR' }, seededRng(1))).toBe(collection)
    expect(withEnglish(collection, {}, seededRng(1))).toBe(collection)
  })

  it('adds nothing when the trip has no pack on the device', () => {
    expect(withEnglish(NO_PACKS, { country: 'EG' }, seededRng(1))).toBe(NO_PACKS)
  })
})

describe('quizCategoryLabel', () => {
  it('names English even when the trip no longer carries it, and a pack category as its pack does', () => {
    expect(quizCategoryLabel(NO_PACKS, ENGLISH_CATEGORY)).toBe('İngilizce')
    expect(quizCategoryLabel(NO_PACKS, 'gone-pack:history')).toBe('history')
  })
})
