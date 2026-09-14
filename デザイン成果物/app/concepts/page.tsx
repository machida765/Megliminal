import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { concepts } from '@/components/concepts/concept-data'
import './concepts.css'

export default function ConceptsPage() {
  return <main className="concept-index">
    <header className="index-head"><Link href="/" className="index-logo">Megliminal</Link><span>TWELVE DIRECTIONS / 2026</span></header>
    <section className="index-intro"><p>DESIGN EXPLORATION 04</p><h1>偶然との出会いを、<br/>12の空間から考える。</h1><p className="index-lead">歩き方、読み方、つながり方まで異なる12のトップページ。新しい3案は、明るく柔らかな本屋体験を掘り下げました。</p></section>
    <section className="concept-grid" aria-label="デザイン案一覧">{concepts.map((item, i) => <Link href={item.href} className={`concept-tile tile-${i+1}`} key={item.href}><div className="tile-number">{String(i+1).padStart(2,'0')}</div><div className="tile-art" aria-hidden="true"><i/><i/><i/><i/></div><div><small>{item.group}</small><h2>{item.name}</h2><p>{item.description}</p></div><ArrowUpRight/></Link>)}</section>
    <footer className="index-foot"><Link href="/">保存済みの8テーマ版を見る</Link><p>Megliminal — recommendations beyond categories</p></footer>
  </main>
}
