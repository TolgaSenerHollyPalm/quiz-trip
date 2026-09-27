import tones from './tones.module.css'

export type Tone = 'teal' | 'coral' | 'amber' | 'neutral' | 'trip'

export function toneClass(tone: Tone): string {
  return tones[tone]
}
