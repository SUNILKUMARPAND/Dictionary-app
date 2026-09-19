import { useEffect, useRef } from 'react'
import { useDictation } from '../hooks/useDictation.js'

export default function SearchBar({ value, onChange, onSubmit }) {
  const inputRef = useRef(null)
  const { supported, listening, error, start, stop } = useDictation({
    onInterim: onChange,
    onFinal: onSubmit,
  })

  // Press "/" anywhere to jump to the search box.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    onSubmit(value)
  }

  return (
    <div className="search-wrap">
      <form className={`search${listening ? ' listening' : ''}`} onSubmit={submit} role="search">
        <span className="search-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={listening ? 'Listening… say a word' : 'Type or dictate a word…'}
          aria-label="Word to look up"
          autoComplete="off"
          spellCheck="false"
          autoFocus
        />
        {value && !listening && (
          <button type="button" className="icon-btn" onClick={() => onChange('')} aria-label="Clear">
            ✕
          </button>
        )}
        {supported && (
          <button
            type="button"
            className={`mic${listening ? ' on' : ''}`}
            onClick={listening ? stop : start}
            aria-pressed={listening}
            aria-label={listening ? 'Stop dictation' : 'Dictate a word'}
            title={listening ? 'Stop dictation' : 'Dictate a word'}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
              <path
                d="M5 11a7 7 0 0 0 14 0M12 18v3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
        <button type="submit" className="go" disabled={!value.trim()}>
          Look up
        </button>
      </form>
      <p className="hint" role={error ? 'alert' : undefined}>
        {error ??
          (supported
            ? 'Tip: press / to search, or tap the mic and say a word.'
            : 'Voice dictation is not supported in this browser — typing works everywhere.')}
      </p>
    </div>
  )
}
