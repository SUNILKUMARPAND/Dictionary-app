import { useCallback, useEffect, useRef, useState } from 'react'
import { capitalize } from '../utils.js'

// Primary source: Wiktionary REST (keyless, CORS-enabled). Enrichment
// (IPA + audio + synonyms) comes from dictionaryapi.dev when it is reachable;
// the app works fine without it.
const WIKTIONARY = 'https://en.wiktionary.org/api/rest_v1/page/definition/'
const SUGGEST =
  'https://en.wiktionary.org/w/api.php?action=opensearch&limit=6&format=json&origin=*&search='
const FREE_DICT = 'https://api.dictionaryapi.dev/api/v2/entries/en/'

const textOf = (html) => new DOMParser().parseFromString(html, 'text/html').body.textContent.trim()

async function fetchEntries(word, signal) {
  const candidates = [...new Set([word, capitalize(word)])]
  for (const candidate of candidates) {
    const res = await fetch(WIKTIONARY + encodeURIComponent(candidate), { signal })
    if (res.status === 404) continue
    if (!res.ok) throw new Error(`Dictionary service returned ${res.status}`)
    const json = await res.json()
    const entries = (json.en ?? [])
      .map((entry) => ({
        partOfSpeech: entry.partOfSpeech,
        definitions: entry.definitions
          .filter((d) => textOf(d.definition).length > 1)
          .map((d) => ({
            html: d.definition,
            examples: (d.parsedExamples?.map((e) => e.example) ?? d.examples ?? []).slice(0, 2),
          })),
      }))
      .filter((entry) => entry.definitions.length > 0)
    if (entries.length > 0) return { title: candidate, entries }
  }
  return null
}

async function fetchSuggestions(word, signal) {
  try {
    const res = await fetch(SUGGEST + encodeURIComponent(word), { signal })
    if (!res.ok) return []
    const json = await res.json()
    return (json[1] ?? []).filter((s) => s.toLowerCase() !== word && !s.includes(':'))
  } catch (err) {
    if (err.name === 'AbortError') throw err
    return []
  }
}

async function fetchExtras(word, signal) {
  try {
    const res = await fetch(FREE_DICT + encodeURIComponent(word), {
      signal: AbortSignal.any([signal, AbortSignal.timeout(4000)]),
    })
    if (!res.ok) return null
    const [first, ...rest] = await res.json()
    const all = [first, ...rest]
    const meanings = all.flatMap((e) => e.meanings ?? [])
    const phonetics = all.flatMap((e) => e.phonetics ?? [])
    const uniq = (list) => [...new Set(list)].slice(0, 12)
    return {
      phonetic: first.phonetic ?? phonetics.find((p) => p.text)?.text ?? null,
      audio: phonetics.find((p) => p.audio)?.audio ?? null,
      synonyms: uniq(meanings.flatMap((m) => m.synonyms ?? [])),
      antonyms: uniq(meanings.flatMap((m) => m.antonyms ?? [])),
    }
  } catch (err) {
    if (signal.aborted) throw err
    return null // enrichment is optional: timeout / blocked / not found
  }
}

// Results are cached per word for the life of the page (ok + notfound only —
// network errors are retried).
export function useDefinition(word) {
  const [results, setResults] = useState({})
  const [attempt, setAttempt] = useState(0)
  const resultsRef = useRef(results)

  useEffect(() => {
    resultsRef.current = results
  })

  useEffect(() => {
    if (!word) return
    const cached = resultsRef.current[word]
    if (cached && cached.status !== 'error') return

    const controller = new AbortController()
    const { signal } = controller
    ;(async () => {
      try {
        const found = await fetchEntries(word, signal)
        if (!found) {
          const suggestions = await fetchSuggestions(word, signal)
          setResults((r) => ({ ...r, [word]: { status: 'notfound', suggestions } }))
          return
        }
        setResults((r) => ({ ...r, [word]: { status: 'ok', ...found, extras: null } }))
        const extras = await fetchExtras(found.title.toLowerCase(), signal)
        if (extras) setResults((r) => ({ ...r, [word]: { ...r[word], extras } }))
      } catch (err) {
        if (err.name === 'AbortError' || signal.aborted) return
        setResults((r) => ({ ...r, [word]: { status: 'error', message: err.message } }))
      }
    })()
    return () => controller.abort()
  }, [word, attempt])

  const retry = useCallback(() => {
    setResults((r) => {
      const { [word]: _dropped, ...rest } = r
      return rest
    })
    setAttempt((n) => n + 1)
  }, [word])

  if (!word) return { status: 'idle', data: null, retry }
  const data = results[word]
  return { status: data ? data.status : 'loading', data: data ?? null, retry }
}
