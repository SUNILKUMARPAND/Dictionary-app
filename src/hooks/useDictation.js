import { useCallback, useEffect, useRef, useState } from 'react'

const Recognition =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

const ERRORS = {
  'not-allowed': 'Microphone access was blocked. Allow it in the address bar and try again.',
  'service-not-allowed': 'Speech recognition is not allowed in this browser context.',
  'no-speech': "Didn't catch anything — try again a little closer to the mic.",
  'audio-capture': 'No microphone found.',
  network: 'Speech recognition needs a network connection.',
}

// Browser voice dictation via the Web Speech API. `onInterim` streams the
// partial transcript, `onFinal` fires once with the finished phrase.
export function useDictation({ onInterim, onFinal }) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recRef = useRef(null)
  const handlers = useRef({ onInterim, onFinal })

  useEffect(() => {
    handlers.current = { onInterim, onFinal }
  })

  useEffect(() => () => recRef.current?.abort(), [])

  const start = useCallback(() => {
    if (!Recognition) return
    setError(null)
    const rec = new Recognition()
    rec.lang = 'en-US'
    rec.interimResults = true
    rec.maxAlternatives = 1
    let finalText = ''
    rec.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const { transcript } = event.results[i][0]
        if (event.results[i].isFinal) finalText += transcript
        else interim += transcript
      }
      handlers.current.onInterim?.((finalText + interim).trim())
    }
    rec.onerror = (event) => {
      if (event.error !== 'aborted') setError(ERRORS[event.error] ?? `Dictation error: ${event.error}`)
    }
    rec.onend = () => {
      setListening(false)
      recRef.current = null
      if (finalText.trim()) handlers.current.onFinal?.(finalText.trim())
    }
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setError('Could not start the microphone.')
    }
  }, [])

  const stop = useCallback(() => recRef.current?.stop(), [])

  return { supported: Boolean(Recognition), listening, error, start, stop }
}
