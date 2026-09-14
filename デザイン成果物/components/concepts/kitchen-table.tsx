'use client'
import { useState } from 'react'
import { RefreshCw, Utensils } from 'lucide-react'
import { recommendations } from '../megliminal-data'
import { ConceptNav } from './concept-nav'

export function KitchenTable(){const [rotation,setRotation]=useState(0); const visible=[...recommendations.slice(rotation),...recommendations.slice(0,rotation)]
return <main className="table-page"><header className="table-head"><b>Megliminal</b><p>みんなの「好き」を持ち寄る場所</p><button>あなたも持ち寄る ＋</button></header><section className="table-intro"><div><span>TONIGHT&apos;S TABLE / 19:30</span><h1>ねえ、最近なにが<br/>よかった？</h1></div><p>答えは本じゃなくてもいい。映画でも、音楽でも、<br/>おいしかったものでも。席をひとつ空けて待っています。</p></section>
<section className="tablecloth"><div className="cloth-title"><Utensils/><span>今日の話題</span><b>「ひとりの時間を、ちょっと良くするもの」</b><button onClick={()=>setRotation((rotation+1)%recommendations.length)}><RefreshCw/>話題を変える</button></div>{visible.slice(0,5).map((item,i)=><article className={`table-note note-${i+1}`} key={item.title}><span className="tape"/><small>{item.kind} / from {item.person}</small><h2>{item.title}</h2><p>{item.by}</p><blockquote>「{item.note}」</blockquote></article>)}<div className="coffee-ring" aria-hidden="true"/><div className="pencil" aria-hidden="true">MEGLIMINAL HB</div><button className="empty-plate"><span>＋</span>あなたのおすすめを<br/>ここに置く</button></section>
<section className="table-voices"><p>いま同じテーブルにいる人</p>{['mio — 東京','haru — 神戸','旅する栞 — 金沢','喫茶余白 — 京都'].map(x=><span key={x}>{x}</span>)}</section><ConceptNav current="kitchen-table"/></main>}
