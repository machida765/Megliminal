'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Bookmark,
  Compass,
  Menu,
  Search,
  Shuffle,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { recommendations, shelves, themes, type ThemeId } from './megliminal-data'

function ThemeSwitcher({ active, onChange }: { active: ThemeId; onChange: (id: ThemeId) => void }) {
  return (
    <section className="theme-switcher" aria-label="デザイン案を切り替える">
      <div className="switcher-intro">
        <p>DESIGN STUDIES</p>
        <span>8つの空間を歩いて、Megliminalの表情を比べてください。</span>
      </div>
      <div className="theme-tabs" role="tablist" aria-label="デザインテーマ">
        {themes.map((theme) => (
          <button
            key={theme.id}
            role="tab"
            aria-selected={active === theme.id}
            className={cn('theme-tab', active === theme.id && 'is-active')}
            onClick={() => onChange(theme.id)}
          >
            <small>{theme.group} {theme.index}</small>
            <strong>{theme.name}</strong>
          </button>
        ))}
      </div>
    </section>
  )
}

function SiteHeader() {
  return (
    <header className="site-header">
      <a href="#top" className="brand" aria-label="Megliminal トップへ">
        <span className="brand-mark" aria-hidden="true">M</span>
        <span>Megliminal</span>
      </a>
      <nav className="desktop-nav" aria-label="メインナビゲーション">
        <a href="#discover">見つける</a><a href="#shelves">本棚</a><a href="#people">人から探す</a>
      </nav>
      <div className="header-actions">
        <button className="search-trigger"><Search aria-hidden="true" /><span>キーワードで探す</span><kbd>⌘ K</kbd></button>
        <Button variant="ghost" className="login-button">ログイン</Button>
        <Button className="post-button">おすすめを投稿</Button>
        <Button variant="ghost" size="icon" className="mobile-menu" aria-label="メニューを開く"><Menu /></Button>
      </div>
    </header>
  )
}

function Hero({ themeName, onShuffle }: { themeName: string; onShuffle: () => void }) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow"><Sparkles aria-hidden="true" /> A PLACE FOR SERENDIPITY</p>
        <h1>誰かのおすすめに、<br /><em>偶然出会う。</em></h1>
        <p className="lead">本、映画、音楽、場所、食べもの。ジャンルを越えて、誰かの「本当に好き」に巡り合える場所です。</p>
        <div className="hero-actions">
          <Button className="shuffle-button" onClick={onShuffle}><Shuffle data-icon="inline-start" />偶然にまかせる</Button>
          <a href="#discover" className="text-link">みんなのおすすめを見る <ArrowRight aria-hidden="true" /></a>
        </div>
      </div>
      <div className="hero-object" aria-label={`${themeName}の注目のおすすめ`}>
        <div className="orbit orbit-one" aria-hidden="true" /><div className="orbit orbit-two" aria-hidden="true" />
        <article className="featured-object">
          <div className="featured-cover"><span>今日の<br />偶然</span><small>ISSUE 042</small></div>
          <div className="featured-info"><span>今日の一冊</span><strong>百年の孤独</strong><small>ガブリエル・ガルシア＝マルケス</small></div>
        </article>
        <span className="floating-note note-one">「読み終わったあと、世界の色が濃くなる」</span>
        <span className="floating-note note-two">BOOK · 小説</span>
      </div>
    </section>
  )
}

function RecommendationCard({ item, featured = false }: { item: (typeof recommendations)[number]; featured?: boolean }) {
  const [saved, setSaved] = useState(false)
  return (
    <article className={cn('recommendation-card', item.color, featured && 'card-featured')}>
      <div className="card-visual"><span>{item.kind}</span><b>{item.title.slice(0, 1)}</b></div>
      <div className="card-content">
        <div className="card-meta"><span>{item.kind}</span><button onClick={() => setSaved(!saved)} aria-label={`${item.title}を保存`} aria-pressed={saved}><Bookmark className={saved ? 'saved' : ''} /></button></div>
        <h3>{item.title}</h3><p className="creator">{item.by}</p><blockquote>「{item.note}」</blockquote><p className="recommender">by {item.person}</p>
      </div>
    </article>
  )
}

function ContentSections({ shuffled }: { shuffled: number }) {
  const visible = [...recommendations.slice(shuffled), ...recommendations.slice(0, shuffled)]
  return (
    <div className="content-wrap" id="discover">
      <section className="section-block now-section">
        <div className="section-heading"><div><p className="section-kicker">JUST RECOMMENDED</p><h2>いま、誰かが推したもの</h2></div><a href="#all">すべて見る <ArrowRight /></a></div>
        <div className="recommendation-grid">{visible.slice(0, 4).map((item, index) => <RecommendationCard key={`${item.title}-${shuffled}`} item={item} featured={index === 0} />)}</div>
      </section>
      <section className="shelf-section" id="shelves">
        <div className="section-heading"><div><p className="section-kicker">CURATED SHELVES</p><h2>気分でめぐる棚</h2></div><p>テーマから、思いがけないものへ。</p></div>
        <div className="shelf-list">{shelves.map((shelf, i) => <a href="#discover" className={`shelf shelf-${i + 1}`} key={shelf.label}><span>0{i + 1}</span><strong>{shelf.label}</strong><small>{shelf.count}</small><ArrowRight /></a>)}</div>
      </section>
      <section className="voices-section" id="people">
        <div className="voice-feature"><p className="section-kicker">A PERSON, A WORLD</p><blockquote>「自分では選ばないものを、誰かの言葉を信じて選んでみる。その小さな冒険が好きです。」</blockquote><div><span className="avatar">木</span><p><strong>木村 文乃</strong><small>編集者 · 128 recommendations</small></p></div></div>
        <div className="popular"><p className="section-kicker">POPULAR TAGS</p><h2>いま人気の入口</h2><div className="tag-cloud"><a href="#discover"># ひとり時間</a><a href="#discover"># 旅に出たくなる</a><a href="#discover"># ものづくり</a><a href="#discover"># 夜に聴く</a><a href="#discover"># 小さな贅沢</a><a href="#discover"># 視点が変わる</a></div></div>
      </section>
    </div>
  )
}

export function MegliminalShowcase() {
  const [active, setActive] = useState<ThemeId>('sunroom')
  const [shuffled, setShuffled] = useState(0)
  const current = themes.find((theme) => theme.id === active) ?? themes[0]
  const shuffle = () => setShuffled((value) => (value + 1) % recommendations.length)

  return (
    <main className="showcase-shell">
      <ThemeSwitcher active={active} onChange={setActive} />
      <div key={active} className="site-canvas" data-theme={active}>
        <div className="ambient" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <SiteHeader />
        <div className="theme-caption"><span>{current.group} DESIGN {current.index}</span><strong>{current.name}</strong><p>{current.concept}</p></div>
        <Hero themeName={current.name} onShuffle={shuffle} />
        <ContentSections shuffled={shuffled} />
        <footer><a href="#top" className="brand"><span className="brand-mark">M</span><span>Megliminal</span></a><p>あなたの「好き」が、誰かの偶然になる。</p><button onClick={shuffle}><Compass /> 次の偶然へ</button></footer>
      </div>
    </main>
  )
}
