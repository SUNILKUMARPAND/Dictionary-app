# Dictationary — dictionary with voice dictation (demo)

A single-page **React + Vite** dictionary. Type a word — or tap the mic and
say it — and get live definitions, examples, and pronunciation.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## How it works

- **Definitions** — fetched live from the keyless, CORS-enabled
  [Wiktionary REST API](https://en.wiktionary.org/api/rest_v1/). Results are
  cached per word for the session. Unknown words fall back to Wiktionary's
  `opensearch` for "Did you mean…" suggestions.
- **Clickable definitions** — Wiktionary returns HTML; `RichText.jsx` rebuilds
  it as React nodes (no `dangerouslySetInnerHTML`) and turns every wiki link
  into a button that looks that word up.
- **Voice dictation** — `useDictation` wraps the browser Web Speech API
  (Chrome / Edge / Safari). Interim transcript streams into the search box;
  the finished phrase triggers the lookup. Hidden where unsupported.
- **Pronunciation** — recorded audio when available, otherwise
  `speechSynthesis` reads the word aloud.
- **Optional enrichment** — IPA, audio, synonyms and antonyms come from
  dictionaryapi.dev with a 4s timeout; if it's unreachable the entry simply
  renders without them.
- **Wordbook** — Recent lookups (resolved words only) and Saved words persist
  in one `localStorage` key (`dictationary:wordbook:v1`).
- **Word of the day** — deterministic per calendar day from `src/data/words.js`.

## Structure

| Concern | Where |
| --- | --- |
| Lookup, cache, suggestions, enrichment | `src/hooks/useDefinition.js` |
| Speech recognition | `src/hooks/useDictation.js` |
| Recent + saved words | `src/hooks/useWordbook.js` |
| Entry card, search bar, sidebar, home | `src/components/` |
| Word-of-the-day list | `src/data/words.js` |
