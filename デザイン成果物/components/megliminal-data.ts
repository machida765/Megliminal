export type ThemeId =
  | 'stellar'
  | 'cosmic'
  | 'sunroom'
  | 'lounge'
  | 'corner'
  | 'newbooks'
  | 'spines'
  | 'editors'

export type Theme = {
  id: ThemeId
  group: '宇宙' | '温かみ' | '本屋'
  index: string
  name: string
  concept: string
}

export const themes: Theme[] = [
  { id: 'stellar', group: '宇宙', index: '01', name: '星間書庫', concept: '星々を辿って、まだ知らない「好き」へ。' },
  { id: 'cosmic', group: '宇宙', index: '02', name: 'コズミック・アーカイブ', concept: '観測するように、誰かの偏愛を見つける。' },
  { id: 'sunroom', group: '温かみ', index: '01', name: '日だまりの推薦室', concept: '陽のあたる棚に、好きなものを持ち寄る。' },
  { id: 'lounge', group: '温かみ', index: '02', name: '夜更けの談話室', concept: '夜が深まるほど、話したいおすすめがある。' },
  { id: 'corner', group: '温かみ', index: '03', name: '街角の小さな店', concept: '寄り道から始まる、小さな発見。' },
  { id: 'newbooks', group: '本屋', index: '01', name: '新刊平台', concept: '平積みを眺めるように、今のおすすめを。' },
  { id: 'spines', group: '本屋', index: '02', name: '背表紙迷路', concept: 'タイトルだけを頼りに、棚の奥へ。' },
  { id: 'editors', group: '本屋', index: '03', name: '編集者の選書棚', concept: '世界の見方が少し変わる、カルチャー案内。' },
]

export const recommendations = [
  { kind: '本', title: '暇と退屈の倫理学', by: '國分功一郎', note: '散歩の解像度まで上がる一冊。', person: '小川 由衣', color: 'tone-a' },
  { kind: '映画', title: 'PERFECT DAYS', by: 'ヴィム・ヴェンダース', note: '日常が少しだけ愛おしくなる。', person: '佐藤 響', color: 'tone-b' },
  { kind: '音楽', title: '青葉市子 / Luminescent Creatures', by: '青葉市子', note: '部屋の空気が水辺に変わる。', person: 'mio', color: 'tone-c' },
  { kind: '場所', title: '東京都庭園美術館', by: '白金台', note: '建築と静けさを一緒に味わえる。', person: '喫茶余白', color: 'tone-d' },
  { kind: '食', title: 'レモンと塩のパスタ', by: '休日の昼ごはん', note: '簡単なのに忘れられない味。', person: 'haru', color: 'tone-e' },
  { kind: '道具', title: 'トラベラーズノート', by: '革の手帳', note: '記録したくなる余白がある。', person: '旅する栞', color: 'tone-a' },
]

export const shelves = [
  { label: '雨の日に浸りたい', count: '32 recommendations' },
  { label: '知らない街を歩く', count: '18 recommendations' },
  { label: '考えごとの入口', count: '41 recommendations' },
  { label: '眠る前の30分', count: '27 recommendations' },
]

// 投稿カード表示専用の拡張データ。既存 recommendations と index で対応する。
export type PostDetail = {
  code: string // 分類記号
  handle: string // 推薦者ハンドル
  region: string
  time: string // 投稿時刻ラベル
  moods: string[] // 気分タグ
  likes: number
  saves: number
  responses: number
  long: string // 長めの推薦文
}

export const postDetails: PostDetail[] = [
  { code: 'B-114', handle: '@yui_ogawa', region: '仙台', time: '02:14', moods: ['静けさ', '思索', '散歩'], likes: 482, saves: 213, responses: 27, long: '哲学書と身構えなくていい。退屈という感情をこんなに肯定してもらえるとは思わなかった。読み終えたあと、いつもの通勤路の光の当たり方まで違って見えた。' },
  { code: 'F-207', handle: '@hibiki_s', region: '横浜', time: '23:40', moods: ['日常', '余白', '再生'], likes: 731, saves: 402, responses: 58, long: 'ドラマチックな出来事は起きない。ただ木漏れ日と、繰り返される朝と、小さな習慣が積み重なっていく。観たあと自分の生活を丁寧に扱いたくなる、そういう一本。' },
  { code: 'M-333', handle: '@mio', region: '東京', time: '01:05', moods: ['水辺', '夜', '透明'], likes: 356, saves: 189, responses: 19, long: '深夜に部屋を暗くして聴くと、空気そのものが湿り気を帯びていく感覚がある。歌詞の意味を追う前に、まず呼吸が変わる。イヤホンより少し離したスピーカーで。' },
  { code: 'P-045', handle: '@yohaku_cafe', region: '京都', time: '15:22', moods: ['建築', '静寂', '休息'], likes: 298, saves: 231, responses: 12, long: 'アール・デコの邸宅そのものが作品。人が少ない平日の午後を狙って、庭のベンチで何もしない時間を過ごすのがいちばんの贅沢だと思う。' },
  { code: 'C-512', handle: '@haru_kobe', region: '神戸', time: '12:48', moods: ['簡単', '休日', '定番'], likes: 604, saves: 512, responses: 44, long: 'レモンの皮と塩、オリーブオイルだけ。material が少ないほど、その日の自分の機嫌がそのまま味になる。疲れた休日の昼に何度も助けられている。' },
  { code: 'T-088', handle: '@shiori_travels', region: '金沢', time: '18:30', moods: ['記録', '旅', '手触り'], likes: 421, saves: 367, responses: 23, long: '書けない日があってもいい、と思わせてくれる余白の多さ。使うほど革が育って、旅の湿度や折れ癖まで記録になる。デジタルには戻れなくなった。' },
]
