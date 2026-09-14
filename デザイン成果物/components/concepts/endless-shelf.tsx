'use client'
import { useState } from 'react'
import { Bookmark, Search } from 'lucide-react'
import { recommendations, shelves } from '../megliminal-data'
import { ConceptNav } from './concept-nav'

export function EndlessShelf(){const [active,setActive]=useState(0); const item=recommendations[active]
 return <main className="shelf-page"><aside className="shelf-index"><h1>M<br/>e<br/>g</h1><p>INDEX</p>{['すべて','読む','観る','聴く','歩く','使う'].map((x,i)=><button key={x} className={i===0?'active':''}>{String(i).padStart(2,'0')}<span>{x}</span></button>)}<button aria-label="検索"><Search/></button></aside>
 <section className="endless"><header><p>THE ENDLESS SHELF</p><h2>タイトルだけを頼りに、<br/>棚の奥へ。</h2><span>SCROLL TO WANDER ↓</span></header>
 {shelves.slice(0,3).map((shelf,row)=><div className="book-row" key={shelf.label}><div className="row-label"><b>{shelf.label}</b><span>{shelf.count}</span></div><div className="books">{recommendations.map((r,i)=><button onClick={()=>setActive(i)} aria-pressed={active===i} className={`book book-${(i+row)%5}`} key={`${row}-${r.title}`}><small>{r.kind}</small><b>{r.title}</b><span>{r.person}</span></button>)}</div></div>)}</section>
 <aside className="reading-slip"><small>NOW IN YOUR HAND</small><div className="slip-number">No. {active+1}</div><p>{item.kind}</p><h2>{item.title}</h2><span>{item.by}</span><blockquote>{item.note}</blockquote><div className="slip-person">推薦者<br/><b>{item.person}</b></div><button><Bookmark/> MY SHELFに挟む</button><p className="hint">背表紙を選ぶと推薦メモが変わります</p></aside><ConceptNav current="endless-shelf"/></main>}
