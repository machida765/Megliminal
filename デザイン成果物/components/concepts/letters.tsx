'use client'
import { useState } from 'react'
import { ArrowRight, Feather, Mail } from 'lucide-react'
import { recommendations } from '../megliminal-data'
import { ConceptNav } from './concept-nav'

export function Letters(){const [active,setActive]=useState(0); const item=recommendations[active]
return <main className="letters-page"><header className="letters-head"><b>Megliminal</b><p>LETTERS OF RECOMMENDATION</p><button><Feather/> おすすめを書く</button></header><div className="mail-layout"><aside className="mailbox"><div className="mailbox-title"><Mail/><div><b>あなたへの手紙</b><span>{recommendations.length}通 届いています</span></div></div>{recommendations.map((r,i)=><button onClick={()=>setActive(i)} className={active===i?'active':''} key={r.title}><span>{String(i+1).padStart(2,'0')}</span><div><b>{r.person} さんから</b><small>{r.kind}についての手紙</small></div><time>SEP {i+1}</time></button>)}</aside>
<section className="open-letter"><div className="postmark">MEG<br/>09.01<br/>2026</div><p className="letter-date">2026年9月{active+1}日　どこかの街から</p><p>まだ会ったことのない、あなたへ。</p><h1>今日は、<em>{item.title}</em>をおすすめしたくて手紙を書きます。</h1><p className="letter-body">{item.note}<br/><br/>これは「絶対に見るべき」という話ではありません。ただ、私の生活の景色を少し変えてくれたものを、棚の向こうにいる誰かにもそっと渡してみたいと思いました。</p><p className="letter-sign">それでは、よい偶然を。<br/><b>{item.person} より</b></p><div className="letter-object"><small>{item.kind}</small><b>{item.title}</b><span>{item.by}</span></div><button className="next-letter" onClick={()=>setActive((active+1)%recommendations.length)}>次の手紙を開く <ArrowRight/></button></section>
<aside className="mail-info"><p>今月届いた言葉</p><strong>126</strong><span>通</span><hr/><blockquote>「知らない誰かの言葉だから、素直に信じられる夜もある。」</blockquote><small>— Megliminal 編集室</small></aside></div><ConceptNav current="letters"/></main>}
