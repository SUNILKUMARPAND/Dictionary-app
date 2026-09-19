import { useState } from 'react'

export default function Sidebar({ history, saved, current, onLookup, onToggleSaved, onClearHistory }) {
  const [tab, setTab] = useState('recent')
  const list = tab === 'recent' ? history : saved

  return (
    <aside className="sidebar" aria-label="Your words">
      <div className="tabs" role="tablist">
        {[
          ['recent', `Recent (${history.length})`],
          ['saved', `Saved (${saved.length})`],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'tab active' : 'tab'}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="empty">
          {tab === 'recent'
            ? 'Words you look up will appear here.'
            : 'Tap ☆ on any word to keep it here.'}
        </p>
      ) : (
        <ul className="wordlist">
          {list.map((w) => (
            <li key={w} className={w === current ? 'current' : undefined}>
              <button type="button" className="row-main" onClick={() => onLookup(w)}>
                {w}
              </button>
              {tab === 'saved' && (
                <button
                  type="button"
                  className="row-x"
                  onClick={() => onToggleSaved(w)}
                  aria-label={`Remove ${w} from saved`}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {tab === 'recent' && history.length > 0 && (
        <button type="button" className="link-btn" onClick={onClearHistory}>
          Clear history
        </button>
      )}
    </aside>
  )
}
