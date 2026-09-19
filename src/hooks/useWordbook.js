import { useCallback, useEffect, useState } from 'react'

const KEY = 'dictationary:wordbook:v1'
const HISTORY_LIMIT = 25

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY))
    return {
      history: Array.isArray(parsed?.history) ? parsed.history : [],
      saved: Array.isArray(parsed?.saved) ? parsed.saved : [],
    }
  } catch {
    return { history: [], saved: [] }
  }
}

// Recent lookups + saved words, persisted together under one key.
export function useWordbook() {
  const [book, setBook] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(book))
    } catch {
      // storage full / disabled — the wordbook just won't survive a reload
    }
  }, [book])

  const addHistory = useCallback((word) => {
    setBook((b) => ({
      ...b,
      history: [word, ...b.history.filter((w) => w !== word)].slice(0, HISTORY_LIMIT),
    }))
  }, [])

  const toggleSaved = useCallback((word) => {
    setBook((b) => ({
      ...b,
      saved: b.saved.includes(word) ? b.saved.filter((w) => w !== word) : [word, ...b.saved],
    }))
  }, [])

  const clearHistory = useCallback(() => setBook((b) => ({ ...b, history: [] })), [])

  return { ...book, addHistory, toggleSaved, clearHistory }
}
