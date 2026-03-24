'use client'
import { useEffect, useState } from 'react'
import { List } from 'lucide-react'

interface Heading { id: string; text: string; level: number }

export default function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState('')

  useEffect(() => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const els = doc.querySelectorAll('h2, h3')
    const items: Heading[] = []
    els.forEach((el, i) => {
      const id = el.id || `heading-${i}`
      items.push({ id, text: el.textContent || '', level: parseInt(el.tagName[1]) })
    })
    setHeadings(items)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-80px 0px -70% 0px' }
    )
    headings.forEach(h => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
        <List className="w-4 h-4" /> বিষয়সূচি
      </h3>
      <nav className="space-y-1">
        {headings.map((h) => (
          <a key={h.id} href={`#${h.id}`}
            className={`block text-sm py-1 transition-colors rounded px-2 ${h.level === 3 ? 'ml-3' : ''} ${active === h.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'}`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  )
}
