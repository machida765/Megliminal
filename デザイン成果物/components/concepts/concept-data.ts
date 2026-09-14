export const concepts = [
  { href:'/concepts/constellation',group:'COSMIC',name:'推薦星図',description:'人の偏愛を星として観測する、静かな探索端末。' },
  { href:'/concepts/floor-map',group:'BOOKSTORE',name:'店内案内図',description:'平台や棚の間を歩きながら見つける実店舗体験。' },
  { href:'/concepts/endless-shelf',group:'BOOKSTORE',name:'終わらない本棚',description:'背表紙の海から直感だけで一冊を引き抜く。' },
  { href:'/concepts/kitchen-table',group:'WARM',name:'持ち寄りの食卓',description:'友人の家でおすすめを囲むような賑やかな場所。' },
  { href:'/concepts/letters',group:'WARM',name:'知らない人からの手紙',description:'届いた言葉を一通ずつ、静かに開封する。' },
  { href:'/concepts/after-hours-mall',group:'LIMINAL',name:'閉店後のモール',description:'消灯した店舗に、誰かの偏愛だけが残る。' },
  { href:'/concepts/poolroom',group:'LIMINAL',name:'水面下の放送室',description:'無人のプールに漂う投稿を館内放送のように聴く。' },
  { href:'/concepts/marginalia',group:'BOOK',name:'余白の図書室',description:'巨大な見開き本の本文、脚注、書き込みを辿る。' },
  { href:'/concepts/card-catalogue',group:'BOOK',name:'偏愛カード目録',description:'木の引き出しから推薦カードを繰り出す。' },
  { href:'/concepts/reading-window',group:'BOOK / SOFT',name:'選書の窓辺',description:'自然光のなか、ひとつの推薦から広がるつながりを辿る。' },
  { href:'/concepts/circulation-table',group:'BOOK / COMMUNITY',name:'おすすめの回覧板',description:'推薦と返事が、共同テーブルで会話になっていく。' },
  { href:'/concepts/book-relay',group:'BOOK / RELAY',name:'本の交換便',description:'誰かの好きが包みになり、次の誰かへ届く。' },
] as const
export type ConceptSlug=typeof concepts[number]['href'] extends `/concepts/${infer S}`?S:never
