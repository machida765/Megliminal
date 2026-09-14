'use client'
import { useState } from 'react'
import { Crosshair, Radio, Sparkles } from 'lucide-react'
import { recommendations } from '../megliminal-data'
import { ConceptNav } from './concept-nav'

export function Constellation() {
 const [active,setActive]=useState(0); const item=recommendations[active]
 return <main className="constellation-page">
  <header className="cosmos-head"><b>MEGLIMINAL / OBSERVATORY</b><div><span className="signal"/>偶然性レベル 78%</div><button>観測記録</button></header>
  <aside className="cosmos-side"><p>COORDINATES</p>{['すべて','本とことば','音の景色','遠くの場所','日々の道具'].map((x,i)=><button className={i===0?'active':''} key={x}>0{i+1} {x}</button>)}<div className="cosmos-status"><Radio/><small>誰かが今、<br/>おすすめを送信中</small></div></aside>
  <section className="star-field" aria-label="推薦星図"><div className="meteor"/>{recommendations.map((r,i)=><button key={r.title} aria-pressed={active===i} onClick={()=>setActive(i)} className={`star star-${i+1}`}><i/><span>{r.kind}<b>{r.title}</b></span></button>)}
   <article className="planet-card"><div className="planet"><span>{item.title.slice(0,1)}</span></div><p>OBSERVATION #{String(active+42).padStart(3,'0')}</p><h1>{item.title}</h1><span>{item.by}</span><blockquote>「{item.note}」</blockquote><button onClick={()=>setActive((active+1)%recommendations.length)}><Crosshair/> 次の星を観測</button></article>
  </section>
  <section className="observation-log"><span><Sparkles/>LATEST SIGNALS</span><p>東京から「夜に聴く音楽」が届きました</p><p>京都から「雨の日の映画」が届きました</p></section><ConceptNav current="constellation"/>
 </main>
}
