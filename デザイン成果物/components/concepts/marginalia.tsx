'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Bookmark, Heart, MessageCircle, Pencil, Plus, Quote, Search } from 'lucide-react'
import { postDetails, recommendations } from '../megliminal-data'
import { ConceptNav } from './concept-nav'

export function Marginalia() {
  const [active,setActive]=useState(0)
  const [turning,setTurning]=useState(false)
  const item=recommendations[active]
  const detail=postDetails[active]
  const move=(next:number)=>{setTurning(true);window.setTimeout(()=>{setActive((next+recommendations.length)%recommendations.length);setTurning(false)},260)}

  return <main className="margin-page">
    <header className="margin-header"><b>Megliminal</b><p>THE MARGINALIA LIBRARY</p><nav><button aria-label="検索"><Search/></button><button><Pencil/> 余白に残す</button></nav></header>
    <section className="margin-intro"><span>VOL. 03　ISSUE 09</span><h1>誰かが引いた線の先に、<br/>まだ知らない世界がある。</h1><p>推薦は本文だけでは完成しない。<br/>余白に残された言葉まで、ひとつの投稿です。</p></section>
    <article className={`open-book ${turning?'turning':''}`} aria-live="polite">
      <div className="book-spine" aria-hidden="true"/>
      <section className="book-left">
        <header><span>{detail.code}</span><span>{item.kind} / {detail.region}</span><span>PAGE {String(active*2+24).padStart(3,'0')}</span></header>
        <p className="drop-copy">{detail.long}</p>
        <blockquote><Quote/> {item.note}</blockquote>
        <p className="book-body">この投稿は、ひとつの作品や場所を評価するためのレビューではありません。ある人の生活のなかで、それがどんなふうに光ったのかを記録したものです。だから点数も順位もありません。</p>
        <div className="underlined">気になった一文から、次のページへ。</div>
        <footer><span>POSTED {detail.time} / SEP 02, 2026</span><span>{detail.likes} PEOPLE UNDERLINED</span></footer>
      </section>
      <section className="book-right">
        <span className="chapter">RECOMMENDATION　{String(active+1).padStart(2,'0')}</span>
        <p className="book-kicker">{item.kind}についての推薦</p><h2>{item.title}</h2><p className="book-author">{item.by}</p>
        <div className="recommender"><span>{item.person.slice(0,1)}</span><div><b>{item.person}</b><small>{detail.handle} / {detail.region}</small></div></div>
        <div className="margin-tags">{detail.moods.map(m=><span key={m}>#{m}</span>)}</div>
        <footer><button><Heart/> {detail.likes}</button><button><Bookmark/> {detail.saves}</button><button><MessageCircle/> {detail.responses}</button></footer>
      </section>
      <aside className="scribble scribble-a">「散歩の見え方が変わる」<small>— @night_reader</small></aside>
      <aside className="scribble scribble-b">私も読みました。<br/>第5章が好き。<small>♡ 18</small></aside>
      <button className="sticky-note" onClick={()=>move(active+1)}>この人の次のおすすめ<ArrowRight/></button>
    </article>
    <nav className="page-controls" aria-label="投稿ページ切り替え"><button onClick={()=>move(active-1)}><ArrowLeft/> 前の投稿</button><span>{active+1} / {recommendations.length}</span><button onClick={()=>move(active+1)}>次の投稿 <ArrowRight/></button></nav>
    <button className="add-note"><Plus/> この投稿の余白にひと言</button>
    <ConceptNav current="marginalia"/>
  </main>
}
