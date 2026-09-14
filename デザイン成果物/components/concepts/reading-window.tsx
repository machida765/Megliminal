'use client'
import { useState } from 'react'
import { ArrowRight, Bookmark, Heart, Sun } from 'lucide-react'
import { recommendations, postDetails } from '../megliminal-data'
import { ConceptNav } from './concept-nav'

export function ReadingWindow(){
 const [active,setActive]=useState(0); const r=recommendations[active],d=postDetails[active]
 return <main className="window-page"><header><b>Megliminal</b><span>選書の窓辺 / Reading Window</span><button>おすすめを置く</button></header>
 <section className="window-intro"><div><small>誰かの一冊から、次の一冊へ</small><h1>光のなかで、<br/>選書がつながる。</h1></div><p>ひとつのおすすめを起点に、違う人の記憶や気分へ。窓辺に重なる紙片をたどってください。</p></section>
 <section className="window-scene"><div className="window-light"/><div className="window-focus" aria-live="polite"><div className="window-meta"><span>{d.code} · {r.kind}</span><Sun/></div><h2>{r.title}</h2><p>{r.by}</p><blockquote>{d.long}</blockquote><div className="window-person"><i>{r.person[0]}</i><span><b>{r.person}</b><small>{d.handle} · {d.region}</small></span></div><div className="window-tags">{d.moods.map(x=><span key={x}>#{x}</span>)}</div><footer><span><Heart/> {d.likes}</span><span><Bookmark/> {d.saves}</span><button onClick={()=>setActive((active+1)%6)}>次のつながり <ArrowRight/></button></footer></div>
 <div className="window-branches" aria-label="つながるおすすめ">{recommendations.map((x,i)=><button key={x.title} className={i===active?'active':''} onClick={()=>setActive(i)} aria-pressed={i===active}><small>{postDetails[i].handle}から</small><b>{x.title}</b><span>{i===active?'いま読んでいる':'このつながりを見る'}</span></button>)}</div></section><ConceptNav current="reading-window"/></main>
}
