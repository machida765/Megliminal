'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Grid2X2 } from 'lucide-react'
import { concepts, type ConceptSlug } from './concept-data'

export function ConceptNav({ current }: { current: ConceptSlug }) {
  const index = concepts.findIndex((item) => item.href.endsWith(current))
  const prev = concepts[(index - 1 + concepts.length) % concepts.length]
  const next = concepts[(index + 1) % concepts.length]
  return <nav className="concept-nav" aria-label="デザイン案ナビゲーション">
    <Link href={prev.href} aria-label={`前の案: ${prev.name}`}><ArrowLeft/><span>前の案</span></Link>
    <Link href="/concepts"><Grid2X2/><span>12案を見る</span></Link>
    <Link href={next.href} aria-label={`次の案: ${next.name}`}><span>次の案</span><ArrowRight/></Link>
  </nav>
}
