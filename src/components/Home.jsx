import { starterSearches } from '../data/words.js'

export default function Home({ wordOfDay, onLookup, onRandom }) {
  return (
    <div className="home">
      <section className="wotd">
        <p className="eyebrow">Word of the day</p>
        <h2 className="wotd-word">{wordOfDay.word}</h2>
        <p className="wotd-hint">{wordOfDay.hint}</p>
        <div className="wotd-actions">
          <button type="button" className="primary" onClick={() => onLookup(wordOfDay.word)}>
            See full definition
          </button>
          <button type="button" className="ghost" onClick={onRandom}>
            🎲 Surprise me
          </button>
        </div>
      </section>

      <section>
        <p className="eyebrow">Try one</p>
        <div className="chips">
          {starterSearches.map((w) => (
            <button key={w} type="button" className="chip" onClick={() => onLookup(w)}>
              {w}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
