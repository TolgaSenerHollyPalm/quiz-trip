const VOWELS = 'aeıioöuü'
const BACK_VOWELS = 'aıou'
const HARD_CONSONANTS = 'çfhkpsşt'

/** The name's last letter and last vowel, or nothing when a suffix cannot be judged (a digit, an emoji, no vowel). */
function sound(name: string): { last: string; back: boolean } | undefined {
  const lower = name.trim().toLocaleLowerCase('tr')
  const last = lower.at(-1)
  const vowel = [...lower].reverse().find((letter) => VOWELS.includes(letter))
  if (!last || !/\p{L}/u.test(last) || !vowel) return undefined
  return { last, back: BACK_VOWELS.includes(vowel) }
}

/** "Deniz’de", "Ada’da", "Murat’ta": where the turn is. Undefined when the name will not take a suffix. */
export function locative(name: string): string | undefined {
  const s = sound(name)
  if (!s) return undefined
  return `${name.trim()}’${HARD_CONSONANTS.includes(s.last) ? 't' : 'd'}${s.back ? 'a' : 'e'}`
}
