import { CATEGORIES, DIFFICULTIES, type Pack } from './types.ts'

export type PackCheck = { ok: true; pack: Pack } | { ok: false; errors: string[] }

type JsonObject = Record<string, unknown>

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

const isInteger = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value)

function isDate(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

/** Checks a pack against the schema and lists every problem, in Turkish, so the pack author can fix them in one go. */
export function validatePack(data: unknown): PackCheck {
  if (!isObject(data)) return { ok: false, errors: ['Paket bir JSON nesnesi olmalı.'] }

  const errors: string[] = []
  if (data.schemaVersion !== 1) errors.push('schemaVersion 1 olmalı.')
  if (!isText(data.id)) errors.push('id boş olamaz.')
  if (!isText(data.title)) errors.push('title boş olamaz.')
  if (typeof data.country !== 'string' || !/^[A-Z]{2}$/.test(data.country)) {
    errors.push('country iki büyük harfli ülke kodu olmalı (ör. EG).')
  }
  if (!isText(data.city)) errors.push('city boş olamaz.')
  if (!isInteger(data.version) || data.version < 1) errors.push('version 1 veya daha büyük bir tam sayı olmalı.')
  if (!isDate(data.updatedAt)) errors.push('updatedAt YYYY-AA-GG biçiminde geçerli bir tarih olmalı.')

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('questions en az bir soru içermeli.')
  } else {
    checkQuestions(data.questions, errors)
  }

  if (!Array.isArray(data.predictionTemplates)) {
    errors.push('predictionTemplates bir liste olmalı.')
  } else {
    checkTemplates(data.predictionTemplates, errors)
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, pack: data as unknown as Pack }
}

function checkQuestions(questions: unknown[], errors: string[]) {
  const ids = new Set<string>()
  questions.forEach((question, index) => {
    const label = isObject(question) && isText(question.id) ? `Soru ${question.id}` : `Soru #${index + 1}`
    if (!isObject(question)) {
      errors.push(`${label}: nesne olmalı.`)
      return
    }

    if (!isText(question.id)) errors.push(`${label}: id boş olamaz.`)
    else if (ids.has(question.id)) errors.push(`${label}: bu id başka bir soruda da kullanılmış.`)
    else ids.add(question.id)

    if (!CATEGORIES.some((category) => category === question.category)) {
      errors.push(`${label}: category şunlardan biri olmalı: ${CATEGORIES.join(', ')}.`)
    }
    if (!DIFFICULTIES.some((difficulty) => difficulty === question.difficulty)) {
      errors.push(`${label}: difficulty şunlardan biri olmalı: ${DIFFICULTIES.join(', ')}.`)
    }
    if (!isText(question.text)) errors.push(`${label}: text boş olamaz.`)

    const { options } = question
    if (!Array.isArray(options) || options.length !== 4 || !options.every(isText)) {
      errors.push(`${label}: options boş olmayan 4 şık içermeli.`)
    } else if (new Set(options.map((option) => option.trim().toLocaleLowerCase('tr'))).size !== 4) {
      errors.push(`${label}: aynı şık birden fazla kez yazılmış.`)
    }

    const { answerIndex } = question
    if (!isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      errors.push(`${label}: answerIndex 0 ile 3 arasında bir tam sayı olmalı.`)
    }
    if (!isText(question.explanation)) errors.push(`${label}: explanation boş olamaz.`)
  })
}

function checkTemplates(templates: unknown[], errors: string[]) {
  const ids = new Set<string>()
  templates.forEach((template, index) => {
    const label = isObject(template) && isText(template.id) ? `Şablon ${template.id}` : `Şablon #${index + 1}`
    if (!isObject(template)) {
      errors.push(`${label}: nesne olmalı.`)
      return
    }

    if (!isText(template.id)) errors.push(`${label}: id boş olamaz.`)
    else if (ids.has(template.id)) errors.push(`${label}: bu id başka bir şablonda da kullanılmış.`)
    else ids.add(template.id)

    if (template.type !== 'number' && template.type !== 'choice') {
      errors.push(`${label}: type "number" ya da "choice" olmalı.`)
    }
    if (!isText(template.text)) errors.push(`${label}: text boş olamaz.`)
  })
}
