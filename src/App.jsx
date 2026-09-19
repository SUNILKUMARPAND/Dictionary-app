import { useCallback, useEffect, useState } from 'react'
import './App.css'
import EntryView from './components/EntryView.jsx'
import Home from './components/Home.jsx'
import SearchBar from './components/SearchBar.jsx'
import Sidebar from './components/Sidebar.jsx'
import { words } from './data/words.js'
import { useDefinition } from './hooks/useDefinition.js'
import { useWordbook } from './hooks/useWordbook.js'
import { dayIndex, normalizeWord } from './utils.js'

const wordOfDay = words[dayIndex() % words.length]

export default function App() {
  const [query, setQuery] = useState('')
  const [word, setWord] = useState(null)
  const { status, data, retry } = useDefinition(word)
  const { history, saved, addHistory, toggleSaved, clearHistory } = useWordbook()

  const lookup = useCallback((raw) => {
    const next = normalizeWord(raw)
    if (!next) return
    setQuery(next)
    setWord(next)
  }, [])

  // Only words that actually resolve go into Recent.
  const resolvedTitle = status === 'ok' ? data.title.toLowerCase() : null
  useEffect(() => {
    if (resolvedTitle) addHistory(resolvedTitle)
  }, [resolvedTitle, addHistory])

  const random = () => {
    const pick = words[Math.floor(Math.random() * words.length)]
    lookup(pick.word)
  }

  const home = () => {
    setQuery('')
    setWord(null)
  }

  return (
    <div className="app">
      <header className="top">
        <button type="button" className="brand" onClick={home}>
          <span className="brand-mark" aria-hidden="true">
            Aa
          </span>
          <span>
            Dictation<span className="accent">ary</span>
          </span>
        </button>
        <p className="tagline">Say it. Look it up.</p>
      </header>

      <SearchBar value={query} onChange={setQuery} onSubmit={lookup} />

      <div className="layout">
        <main className="main" aria-live="polite">
          {status === 'idle' && <Home wordOfDay={wordOfDay} onLookup={lookup} onRandom={random} />}

          {status === 'loading' && (
            <div className="state" role="status">
              <span className="spinner" aria-hidden="true" />
              Looking up “{word}”…
            </div>
          )}

          {status === 'ok' && (
            <EntryView
              data={data}
              saved={saved.includes(data.title.toLowerCase())}
              onToggleSaved={toggleSaved}
              onLookup={lookup}
            />
          )}

          {status === 'notfound' && (
            <div className="state">
              <h2>No entry for “{word}”</h2>
              <p>Check the spelling, or try a different form of the word.</p>
              {data.suggestions.length > 0 && (
                <>
                  <p className="eyebrow">Did you mean</p>
                  <div className="chips">
                    {data.suggestions.map((s) => (
                      <button key={s} type="button" className="chip" onClick={() => lookup(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="state">
              <h2>Couldn’t reach the dictionary</h2>
              <p>{data.message}. Check your connection and try again.</p>
              <button type="button" className="primary" onClick={retry}>
                Retry
              </button>
            </div>
          )}
        </main>

        <Sidebar
          history={history}
          saved={saved}
          current={word}
          onLookup={lookup}
          onToggleSaved={toggleSaved}
          onClearHistory={clearHistory}
        />
      </div>
    </div>
  )
}
