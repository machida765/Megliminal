'use client'

import { useState } from 'react'
import { Bookmark, ChevronDown, ChevronRight, Heart, MessageCircle, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { postDetails, recommendations } from '../megliminal-data'
import { ConceptNav } from './concept-nav'

const drawers=['すべて','本・ことば','映画・映像','音楽・音','場所・建築','食・暮らし']

export function CardCatalogue() {
  const [active,setActive]=useState(0)
  const [drawer,setDrawer]=useState(0)
  const item=recommendations[active]
  const detail=postDetails[active]
  return <main className="catalogue-page">
    <header className="catalogue-header"><b>Megliminal</b><div><span>偏愛カード目録</span><small>CATALOGUE OF PERSONAL RECOMMENDATIONS</small></div><nav><button><Search/> 探す</button><button><Plus/> カードを加える</button></nav></header>
    <section className="catalogue-intro"><div><p>DRAWER No. 001—999</p><h1>検索しすぎない、<br/>という探し方。</h1></div><p>分類は入口にすぎません。<br/>引き出しを開け、指に触れたカードから読んでください。</p><span>収蔵カード<br/><b>12,482</b>枚</span></section>
    <div className="catalogue-worktop">
      <aside className="drawer-stack"><p><SlidersHorizontal/> 分類引き出し</p>{drawers.map((d,i)=><button key={d} className={drawer===i?'active':''} onClick={()=>setDrawer(i)}><span>{String(i).padStart(3,'0')}</span><b>{d}</b><ChevronRight/></button>)}</aside>
      <section className="card-deck" aria-label="推薦カード一覧">
        <div className="deck-label"><span>DRAWER {String(drawer).padStart(3,'0')}</span><b>{drawers[drawer]}</b><small>{recommendations.length} CARDS FOUND</small></div>
        {recommendations.map((rec,i)=>{
          const d=postDetails[i]
          return <button key={rec.title} className={`catalogue-card card-pos-${i+1} ${active===i?'active':''}`} onClick={()=>setActive(i)} aria-pressed={active===i}>
            <span className="card-code">{d.code}</span><span className="card-kind">{rec.kind}</span><strong>{rec.title}</strong><small>{rec.by}</small><p>{rec.note}</p><span className="card-owner">推薦　{rec.person}</span>
          </button>
        })}
        <div className="brass-rod" aria-hidden="true"/>
      </section>
      <article className="catalogue-detail" aria-live="polite">
        <header><div><span>MEGLIMINAL ARCHIVE</span><b>{detail.code}</b></div><span className="date-stamp">SEP<br/>02<br/>2026</span></header>
        <div className="detail-heading"><small>{item.kind} / PERSONAL RECOMMENDATION</small><h2>{item.title}</h2><p>{item.by}</p></div>
        <blockquote>{detail.long}</blockquote>
        <div className="detail-person"><span>{item.person.slice(0,1)}</span><div><b>{item.person}</b><small>{detail.handle}　{detail.region}</small></div><button>棚を見る <ChevronRight/></button></div>
        <dl><div><dt>気分分類</dt><dd>{detail.moods.join(' / ')}</dd></div><div><dt>登録時刻</dt><dd>2026.09.02　{detail.time}</dd></div><div><dt>関連カード</dt><dd>{recommendations[(active+1)%recommendations.length].title}</dd></div></dl>
        <footer><button><Heart/> {detail.likes}</button><button><Bookmark/> {detail.saves}</button><button><MessageCircle/> {detail.responses}</button></footer>
        <button className="next-card" onClick={()=>setActive((active+1)%recommendations.length)}>次のカードを繰り出す <ChevronDown/></button>
      </article>
    </div>
    <p className="catalogue-note">カードは毎晩、閉館後に推薦者の手で追加されます。</p>
    <ConceptNav current="card-catalogue"/>
  </main>
}
