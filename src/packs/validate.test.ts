import { describe, expect, it } from 'vitest'
import { validatePack } from './validate.ts'

const validPack = () => ({
  schemaVersion: 1,
  id: 'eg-test',
  title: 'Mısır — Test',
  country: 'EG',
  city: 'Test',
  version: 1,
  updatedAt: '2026-09-19',
  questions: [
    {
      id: 'q1',
      category: 'history',
      difficulty: 'easy',
      text: 'Soru?',
      options: ['A', 'B', 'C', 'D'],
      answerIndex: 0,
      explanation: 'Çünkü A.',
    },
  ],
  predictionTemplates: [{ id: 't1', type: 'number', text: 'Kaç?' }],
})

type PackData = ReturnType<typeof validPack>

function errorsAfter(change: (pack: PackData) => void): string[] {
  const pack = validPack()
  change(pack)
  const result = validatePack(pack)
  return result.ok ? [] : result.errors
}

describe('validatePack', () => {
  it('accepts a valid pack', () => {
    expect(validatePack(validPack())).toEqual({ ok: true, pack: validPack() })
  })

  it('rejects something that is not a JSON object', () => {
    expect(validatePack(null)).toEqual({ ok: false, errors: ['Paket bir JSON nesnesi olmalı.'] })
    expect(validatePack([])).toMatchObject({ ok: false })
  })

  it.each<[string, (pack: PackData) => void, string]>([
    ['an unknown schema version', (pack) => (pack.schemaVersion = 2), 'schemaVersion'],
    ['a lower-case country code', (pack) => (pack.country = 'eg'), 'country'],
    ['a version that is not a whole number', (pack) => (pack.version = 1.5), 'version'],
    ['a date that does not exist', (pack) => (pack.updatedAt = '2026-02-30'), 'updatedAt'],
    ['no questions', (pack) => (pack.questions = []), 'questions'],
    ['an unknown category', (pack) => (pack.questions[0].category = 'sports'), 'Soru q1: category'],
    ['an unknown difficulty', (pack) => (pack.questions[0].difficulty = 'extreme'), 'Soru q1: difficulty'],
    ['three options', (pack) => (pack.questions[0].options = ['A', 'B', 'C']), 'Soru q1: options'],
    ['an empty option', (pack) => (pack.questions[0].options[3] = ' '), 'Soru q1: options'],
    ['the same option twice', (pack) => (pack.questions[0].options = ['İstanbul', 'istanbul', 'C', 'D']), 'Soru q1: aynı şık'],
    ['an answer index outside the options', (pack) => (pack.questions[0].answerIndex = 4), 'Soru q1: answerIndex'],
    ['a missing explanation', (pack) => (pack.questions[0].explanation = ''), 'Soru q1: explanation'],
    ['a duplicate question id', (pack) => pack.questions.push({ ...pack.questions[0] }), 'Soru q1: bu id başka'],
    ['an unknown template type', (pack) => (pack.predictionTemplates[0].type = 'date'), 'Şablon t1: type'],
  ])('rejects %s', (_case, change, message) => {
    expect(errorsAfter(change)).toEqual([expect.stringContaining(message)])
  })

  it('lists every problem at once', () => {
    const errors = errorsAfter((pack) => {
      pack.country = 'Egypt'
      pack.questions[0].answerIndex = -1
    })
    expect(errors).toHaveLength(2)
  })
})

function templateErrors(...templates: Record<string, unknown>[]): string[] {
  const result = validatePack({ ...validPack(), predictionTemplates: templates })
  return result.ok ? [] : result.errors
}

describe('prediction templates', () => {
  const floor = {
    id: 'floor',
    type: 'number',
    text: 'Kat?',
    step: 1,
    params: { min: { key: 'minFloor', label: 'En alt kat' }, max: { key: 'maxFloor', label: 'En üst kat' } },
  }

  it('accepts trip settings, durations and choices', () => {
    const delay = { id: 'delay', type: 'number', text: 'Rötar?', format: 'duration', min: 0, max: 600, step: 1 }
    const view = { id: 'view', type: 'choice', text: 'Manzara?', options: ['Deniz', 'Havuz'] }
    expect(templateErrors(floor, delay, view)).toEqual([])
  })

  it.each<[string, Record<string, unknown>, string]>([
    ['params written as a plain list', { ...floor, params: ['minFloor', 'maxFloor'] }, 'params { "min"'],
    ['a setting without a label', { ...floor, params: { min: { key: 'minFloor' } } }, 'params.min için key ve label'],
    ['a bound given twice', { ...floor, min: 0 }, 'min hem sabit değer hem params'],
    ['an unknown setting', { ...floor, params: { ...floor.params, step: { key: 's', label: 'S' } } }, 'yalnızca min ve max'],
    ['empty params', { ...floor, params: {} }, 'params en az min ya da max'],
    ['min not below max', { id: 'n', type: 'number', text: 'Kaç?', min: 5, max: 5 }, 'min, max değerinden küçük'],
    ['a step of zero', { id: 'n', type: 'number', text: 'Kaç?', step: 0 }, 'step sıfırdan büyük'],
    ['an unknown format', { id: 'n', type: 'number', text: 'Kaç?', format: 'time' }, 'format yalnızca "duration"'],
    ['a duration in part minutes', { id: 'n', type: 'number', text: 'Ne kadar?', format: 'duration', step: 0.5 }, 'tam dakika'],
    ['options on a number', { id: 'n', type: 'number', text: 'Kaç?', options: ['A', 'B'] }, 'number şablonunda options'],
    ['a choice with one option', { id: 'c', type: 'choice', text: 'Hangisi?', options: ['A'] }, 'en az 2 seçenek'],
    ['the same option twice', { id: 'c', type: 'choice', text: 'Hangisi?', options: ['Deniz', 'deniz'] }, 'aynı seçenek'],
    ['a range on a choice', { id: 'c', type: 'choice', text: 'Hangisi?', options: ['A', 'B'], min: 1 }, 'choice şablonunda min'],
  ])('rejects %s', (_case, template, message) => {
    expect(templateErrors(template)).toEqual([expect.stringContaining(message)])
  })

  it('rejects one setting shown with two different labels', () => {
    const other = { ...floor, id: 'floor2', params: { min: { key: 'minFloor', label: 'Alt kat' } } }
    expect(templateErrors(floor, other)).toEqual([expect.stringContaining('"minFloor" başka bir şablonda farklı label')])
  })
})
