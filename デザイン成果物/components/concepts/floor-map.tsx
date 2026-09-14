'use client'
import { useState } from 'react'
import { ArrowRight, MapPin, ShoppingBag } from 'lucide-react'
import { recommendations } from '../megliminal-data'
import { ConceptNav } from './concept-nav'

export function FloorMap() { const [selected,setSelected]=useState(0); const item=recommendations[selected]
 return <main className="floor-page"><header className="store-head"><b>Megliminal<br/><small>RECOMMENDATION STORE</small></b><nav><a href="#map">店内を歩く</a><a href="#staff">店員のおすすめ</a><button><ShoppingBag/> MY SHELF</button></nav></header>
 <section className="store-marquee"><span>本だけじゃない本屋です</span><span>OPEN 7:00—24:00</span><span>きょうの入荷 126件</span></section>
 <section className="floor-intro"><div><p>WELCOME TO MEGLIMINAL</p><h1>知らなかった「好き」が、<br/>棚の角で待っている。</h1></div><p>ここは誰かのおすすめだけを扱う店。<br/>順路はありません。気になる棚からどうぞ。</p></section>
 <section className="floor-map" id="map"><div className="you-are-here"><MapPin/> YOU ARE HERE</div><button className="zone zone-new" onClick={()=>setSelected(0)}><small>01 / ENTRANCE</small><b>本日の平台</b><span>いま届いたおすすめ</span></button><button className="zone zone-film" onClick={()=>setSelected(1)}><small>02 / SCREEN</small><b>映画の小部屋</b><span>暗がりで出会う12選</span></button><button className="zone zone-sound" onClick={()=>setSelected(2)}><small>03 / LISTEN</small><b>試聴カウンター</b><span>誰かの生活の音</span></button><button className="zone zone-local" onClick={()=>setSelected(3)}><small>04 / TRAVEL</small><b>街と場所の棚</b><span>遠回りしたい午後に</span></button>
 <article className="floor-detail"><small>いま手に取ったもの</small><h2>{item.title}</h2><p>{item.by}</p><blockquote>「{item.note}」</blockquote><span>推薦した人 — {item.person}</span><button>この棚をもっと見る <ArrowRight/></button></article></section>
 <section className="bookseller" id="staff"><span className="staff-portrait">選</span><div><small>BOOKSELLER OF THE WEEK</small><h2>棚の間で、迷ってください。</h2><p>「目的のものだけ見つけて帰るには、この店は少し遠回りです。でも寄り道にこそ、その人らしさが出ると思っています。」</p><b>選書係・木村 文乃</b></div></section><ConceptNav current="floor-map"/></main> }
