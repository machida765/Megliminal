'use client'

import { useState } from 'react'
import { Bookmark, Heart, MessageCircle, Pause, Play, Plus, Volume2, Waves } from 'lucide-react'
import { postDetails, recommendations } from '../megliminal-data'
import { ConceptNav } from './concept-nav'

export function Poolroom() {
  const [active,setActive]=useState(2)
  const [playing,setPlaying]=useState(true)
  const item=recommendations[active]
  const detail=postDetails[active]

  return <main className="pool-page">
    <div className="pool-caustics" aria-hidden="true"/>
    <header className="pool-header"><b>Megliminal</b><span><Waves/> POOLROOM BROADCAST 81.4</span><button><Plus/> 浮かべる</button></header>
    <section className="pool-heading"><p>深度 1.4M　／　水温 27°C　／　入室者 1</p><h1>声のないプールに、<br/>誰かのおすすめが浮かぶ。</h1><span>気になるタイルに触れてください</span></section>
    <section className="pool-water" aria-label="水面に浮かぶ投稿">
      <div className="pool-grid" aria-hidden="true"/>
      {recommendations.map((rec,i)=>{
        const d=postDetails[i]
        return <button key={rec.title} className={`float-post float-${i+1} ${active===i?'selected':''}`} onClick={()=>{setActive(i);setPlaying(true)}} aria-pressed={active===i}>
          <span className="float-kind">{rec.kind}　{d.code}</span><strong>{rec.title}</strong><small>{rec.person} のおすすめ</small><i>{rec.note}</i>
          {active===i&&<span className="ripple" aria-hidden="true"/>}
        </button>
      })}
    </section>
    <aside className="broadcast-panel" aria-live="polite">
      <header><span>NOW BROADCASTING</span><i>CH. {String(active+1).padStart(2,'0')}</i></header>
      <div className="broadcast-person"><span>{item.person.slice(0,1)}</span><div><b>{item.person}</b><small>{detail.handle} — {detail.region}</small></div><time>{detail.time}</time></div>
      <div className="waveform" aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} style={{height:`${12+((i*17)%35)}px`}}/>)}</div>
      <h2>{item.title}</h2><p>{item.by}</p><blockquote>「{detail.long}」</blockquote>
      <div className="broadcast-tags">{detail.moods.map(m=><span key={m}>#{m}</span>)}</div>
      <div className="broadcast-controls"><button onClick={()=>setPlaying(!playing)} aria-label={playing?'一時停止':'再生'}>{playing?<Pause/>:<Play/>}</button><Volume2/><div><i style={{width:playing?'64%':'0%'}}/></div><time>01:42 / 02:37</time></div>
      <footer><button><Heart/> {detail.likes}</button><button><Bookmark/> {detail.saves}</button><button><MessageCircle/> {detail.responses}</button></footer>
    </aside>
    <p className="pool-depth">DEEP END<br/><b>2.0M</b></p>
    <ConceptNav current="poolroom"/>
  </main>
}
