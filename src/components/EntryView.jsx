import { useRef } from 'react'
import { speak } from '../utils.js'
import RichText from './RichText.jsx'

function WordChips({ label, words, onLookup }) {
  if (!words?.length) return null
  return (
    <div className="chips-row">
      <span className="chips-label">{label}</span>
      {words.map((w) => (
        <button key={w} type="button" className="chip" onClick={() => onLookup(w)}>
          {w}
        </button>
      ))}
    </div>
  )
}

export default function EntryView({ data, saved, onToggleSaved, onLookup }) {
  const audioRef = useRef(null)
  const { title, entries, extras } = data

  const pronounce = () => {
    // Prefer the recorded pronunciation when we have one; fall back to TTS.
    if (extras?.audio) {
      audioRef.current?.pause()
      audioRef.current = new Audio(extras.audio)
      audioRef.current.play().catch(() => speak(title))
    } else {
      speak(title)
    }
  }

  return (
    <article className="entry">
      <header className="entry-head">
        <div>
          <h2 className="entry-word">{title}</h2>
          {extras?.phonetic && <p className="phonetic">{extras.phonetic}</p>}
        </div>
        <div className="entry-actions">
          <button type="button" className="round" onClick={pronounce} aria-label={`Pronounce ${title}`}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
              <path
                d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`round${saved ? ' active' : ''}`}
            onClick={() => onToggleSaved(title.toLowerCase())}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${title} from saved words` : `Save ${title}`}
          >
            {saved ? '★' : '☆'}
          </button>
        </div>
      </header>

      {entries.map((entry, i) => (
        <section key={`${entry.partOfSpeech}-${i}`} className="meaning">
          <h3 className="pos">{entry.partOfSpeech}</h3>
          <ol className="defs">
            {entry.definitions.map((def, j) => (
              <li key={j}>
                <p className="def">
                  <RichText html={def.html} onLookup={onLookup} />
                </p>
                {def.examples.map((ex, k) => (
                  <p key={k} className="example">
                    “<RichText html={ex} onLookup={onLookup} />”
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </section>
      ))}

      <WordChips label="Synonyms" words={extras?.synonyms} onLookup={onLookup} />
      <WordChips label="Antonyms" words={extras?.antonyms} onLookup={onLookup} />

      <footer className="source">
        Definitions from{' '}
        <a
          href={`https://en.wiktionary.org/wiki/${encodeURIComponent(title)}`}
          target="_blank"
          rel="noreferrer"
        >
          Wiktionary
        </a>{' '}
        (CC BY-SA). Tap any underlined word to look it up.
      </footer>
    </article>
  )
}
