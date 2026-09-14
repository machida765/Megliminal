'use client'

import { useState } from 'react'
import { Bookmark, ChevronRight, Eye, Heart, MapPin, MessageCircle, Plus, Radio, Search } from 'lucide-react'
import { postDetails, recommendations } from '../megliminal-data'
import { ConceptNav } from './concept-nav'

const shops = ['NORTH GATE', 'BOOKS', 'CINEMA', 'MUSIC', 'FOOD', 'LIFESTYLE']

export function AfterHoursMall() {
  const [active, setActive] = useState(1)
  const item = recommendations[active]
  const detail = postDetails[active]

  return <main className="mall-page">
    <header className="mall-header"><div><Radio/><span>MEGLIMINAL MALL</span><small>AFTER HOURS ARCHIVE</small></div><time>02:37:18</time><nav><button aria-label="検索"><Search/></button><button>投稿を残す <Plus/></button></nav></header>
    <div className="mall-ticker"><span>本日の営業は終了しました</span><span>RECOMMENDATIONS REMAIN LIT</span><span>次回開館 10:00</span></div>
    <section className="mall-intro"><div><p>FLOOR B1 — LIGHTS OUT</p><h1>誰もいない場所に、<br/><em>好きだけが残っている。</em></h1></div><p>閉店後のモールを歩くように、ジャンルの境目を越えて。<br/>光っているウィンドウを選ぶと、誰かの推薦が開きます。</p></section>
    <div className="mall-directory" aria-label="フロア案内">{shops.map((shop, i)=><span key={shop} className={i===active?'lit':''}>{String(i+1).padStart(2,'0')} {shop}</span>)}</div>
    <section className="mall-corridor" aria-label="閉店後の推薦店舗">
      <div className="mall-perspective-lines" aria-hidden="true"/>
      {recommendations.map((rec,i)=>{
        const d=postDetails[i]
        return <button key={rec.title} className={`store-window window-${i+1} ${active===i?'open':''}`} onClick={()=>setActive(i)} aria-pressed={active===i}>
          <span className="store-sign">{rec.kind.toUpperCase()} / {d.code}</span>
          <span className="store-glass"><small>推薦者 {rec.person}</small><strong>{rec.title}</strong><span>{rec.note}</span><i>{d.moods.map(m=>`#${m}`).join(' ')}</i></span>
          <span className="store-shutter" aria-hidden="true"/>
        </button>
      })}
    </section>
    <section className="mall-post-detail" aria-live="polite">
      <div className="mall-post-meta"><span>{detail.code}</span><span>{item.kind}</span><span><MapPin/> {detail.region}</span><time>{detail.time}</time></div>
      <div className="mall-post-main"><div><small>WINDOW DISPLAY / RECOMMENDATION</small><h2>{item.title}</h2><p className="mall-credit">{item.by}</p><blockquote>{detail.long}</blockquote><div className="mall-tags">{detail.moods.map(m=><span key={m}>#{m}</span>)}</div></div><aside><span className="mall-avatar">{item.person.slice(0,1)}</span><b>{item.person}</b><small>{detail.handle}</small><p>この人の棚をもっと見る <ChevronRight/></p></aside></div>
      <footer><span><Eye/> 閲覧 1,284</span><button><Heart/> {detail.likes}</button><button><Bookmark/> {detail.saves}</button><button><MessageCircle/> {detail.responses}</button></footer>
    </section>
    <div className="mall-cctv">CAM 04　● REC　{detail.time}:32</div>
    <ConceptNav current="after-hours-mall"/>
  </main>
}
