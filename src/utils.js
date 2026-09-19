export const normalizeWord = (raw) =>
  raw
    .toLowerCase()
    .replace(/[.,!?;:"“”]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)

// Same word for everyone on a given local calendar day.
export function dayIndex(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date - start) / 86_400_000) + date.getFullYear() * 366
}

export function speak(text) {
  if (!('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'en-US'
  utter.rate = 0.9
  window.speechSynthesis.speak(utter)
  return true
}
