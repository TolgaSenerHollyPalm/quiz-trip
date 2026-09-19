import { CATEGORIES, DIFFICULTIES, type Pack } from './types.ts'

export type PackCheck = { ok: true; pack: Pack } | { ok: false; errors: string[] }

type JsonObject = Record<string, unknown>

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

const isInteger = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value)

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const hasDuplicates = (texts: string[]) =>
  new Set(texts.map((text) => text.trim().toLocaleLowerCase('tr'))).size !== texts.length

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
    } else if (hasDuplicates(options)) {
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
  const paramLabels = new Map<string, string>() // a shared param key must read the same everywhere
  templates.forEach((template, index) => {
    const label = isObject(template) && isText(template.id) ? `Şablon ${template.id}` : `Şablon #${index + 1}`
    if (!isObject(template)) {
      errors.push(`${label}: nesne olmalı.`)
      return
    }

    if (!isText(template.id)) errors.push(`${label}: id boş olamaz.`)
    else if (ids.has(template.id)) errors.push(`${label}: bu id başka bir şablonda da kullanılmış.`)
    else ids.add(template.id)

    if (!isText(template.text)) errors.push(`${label}: text boş olamaz.`)
    if (template.type === 'number') checkNumberTemplate(template, label, paramLabels, errors)
    else if (template.type === 'choice') checkChoiceTemplate(template, label, errors)
    else errors.push(`${label}: type "number" ya da "choice" olmalı.`)
  })
}

function checkNumberTemplate(
  template: JsonObject,
  label: string,
  paramLabels: Map<string, string>,
  errors: string[],
) {
  const { unit, format, min, max, step, params } = template
  if (unit !== undefined && !isText(unit)) errors.push(`${label}: unit boş olmayan bir metin olmalı.`)
  if (format !== undefined && format !== 'duration') errors.push(`${label}: format yalnızca "duration" olabilir.`)
  for (const [name, value] of Object.entries({ min, max, step })) {
    if (value !== undefined && !isNumber(value)) errors.push(`${label}: ${name} bir sayı olmalı.`)
  }
  if (isNumber(step) && step <= 0) errors.push(`${label}: step sıfırdan büyük olmalı.`)
  if (isNumber(min) && isNumber(max) && min >= max) errors.push(`${label}: min, max değerinden küçük olmalı.`)
  if (format === 'duration' && [min, max, step].some((value) => isNumber(value) && (!Number.isInteger(value) || value < 0))) {
    errors.push(`${label}: süre şablonunda min, max ve step sıfır ya da pozitif tam dakika olmalı.`)
  }
  if (template.options !== undefined) errors.push(`${label}: number şablonunda options olamaz.`)

  if (params === undefined) return
  if (Array.isArray(params)) {
    errors.push(`${label}: params { "min": { "key": …, "label": … }, "max": { … } } biçiminde yazılmalı.`)
    return
  }
  if (!isObject(params)) {
    errors.push(`${label}: params bir nesne olmalı.`)
    return
  }
  const { min: minParam, max: maxParam, ...others } = params
  if (Object.keys(others).length > 0) errors.push(`${label}: params yalnızca min ve max içerebilir.`)
  if (minParam === undefined && maxParam === undefined) errors.push(`${label}: params en az min ya da max içermeli.`)
  for (const [bound, param] of Object.entries({ min: minParam, max: maxParam })) {
    if (param === undefined) continue
    if (template[bound] !== undefined) errors.push(`${label}: ${bound} hem sabit değer hem params olarak verilmiş.`)
    if (!isObject(param) || !isText(param.key) || !isText(param.label)) {
      errors.push(`${label}: params.${bound} için key ve label gerekli.`)
      continue
    }
    const known = paramLabels.get(param.key)
    if (known === undefined) paramLabels.set(param.key, param.label)
    else if (known !== param.label) errors.push(`${label}: "${param.key}" başka bir şablonda farklı label ile kullanılmış.`)
  }
}

function checkChoiceTemplate(template: JsonObject, label: string, errors: string[]) {
  const { options } = template
  if (!Array.isArray(options) || options.length < 2 || !options.every(isText)) {
    errors.push(`${label}: options boş olmayan en az 2 seçenek içermeli.`)
  } else if (hasDuplicates(options)) {
    errors.push(`${label}: aynı seçenek birden fazla kez yazılmış.`)
  }
  for (const key of ['unit', 'format', 'min', 'max', 'step', 'params']) {
    if (template[key] !== undefined) errors.push(`${label}: choice şablonunda ${key} olamaz.`)
  }
}
