import { useMemo } from 'react'

// Wiktionary returns definitions as HTML. Rather than dangerouslySetInnerHTML,
// walk the parsed DOM and rebuild it as React nodes: wiki links become
// "look this word up" buttons, emphasis is kept, everything else is flattened.
function convert(node, onLookup, key) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent
  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const tag = node.tagName.toLowerCase()
  if (tag === 'style' || tag === 'script' || tag === 'sup') return null

  const kids = Array.from(node.childNodes, (child, i) => convert(child, onLookup, i))
  const title = node.getAttribute('title')

  if (tag === 'a' && node.getAttribute('rel') === 'mw:WikiLink' && title && !title.includes(':')) {
    return (
      <button key={key} type="button" className="wordlink" onClick={() => onLookup(title)}>
        {kids}
      </button>
    )
  }
  if (tag === 'b' || tag === 'strong') return <strong key={key}>{kids}</strong>
  if (tag === 'i' || tag === 'em') return <em key={key}>{kids}</em>
  return <span key={key}>{kids}</span>
}

export default function RichText({ html, onLookup }) {
  const content = useMemo(() => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return Array.from(doc.body.childNodes, (n, i) => convert(n, onLookup, i))
  }, [html, onLookup])
  return <>{content}</>
}
