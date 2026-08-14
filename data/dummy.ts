// data/dummy.ts（v2 - 横断タグ型対応）
// シードデータ。実行時は lib/data/local-store.ts 経由で利用する。
// 画面から直接 import せず、getRepository() / hooks を使うこと。

import { MajorCategory, SubCategory, Tag, User, Post } from '@/types';

// ─────────────────────────────────────────
// 大カテゴリ（管理者が追加・削除・並び替え・表示切替できる）
// ─────────────────────────────────────────
export const MAJOR_CATEGORIES: MajorCategory[] = [
  { id: 'youtube',  name: 'YouTube',     icon: 'Youtube',          order: 1, isActive: true },
  { id: 'books',    name: '本・書籍',    icon: 'BookOpen',         order: 2, isActive: true },
  { id: 'movies',   name: '映画',        icon: 'Film',             order: 3, isActive: true },
  { id: 'music',    name: '音楽',        icon: 'Music',            order: 4, isActive: true },
  { id: 'games',    name: 'ゲーム',      icon: 'Gamepad2',         order: 5, isActive: true },
  { id: 'apps',     name: 'アプリ・ツール', icon: 'Cpu',           order: 6, isActive: true },
  { id: 'food',     name: '飲食・グルメ',icon: 'UtensilsCrossed',  order: 7, isActive: true },
  { id: 'gadgets',  name: 'ガジェット',  icon: 'Lightbulb',        order: 8, isActive: true },
  { id: 'spots',    name: '場所・スポット', icon: 'MapPin',         order: 9, isActive: true },
  { id: 'other',    name: 'その他',      icon: 'MoreHorizontal',   order: 10, isActive: true },
];

// ─────────────────────────────────────────
// 中・小ジャンル（大ジャンルに紐づく。投稿時は任意）
// ─────────────────────────────────────────
export const SUB_CATEGORIES: SubCategory[] = [
  // 本・書籍
  { id: 'books-novel',        majorCategoryId: 'books',    name: '小説',             order: 1, isActive: true },
  { id: 'books-nonfiction',   majorCategoryId: 'books',    name: 'ノンフィクション', order: 2, isActive: true },
  { id: 'books-business',     majorCategoryId: 'books',    name: 'ビジネス書',       order: 3, isActive: true },
  { id: 'books-manga',        majorCategoryId: 'books',    name: '漫画',             order: 4, isActive: true },
  { id: 'books-light-novel',  majorCategoryId: 'books',    name: 'ライトノベル',     order: 5, isActive: true },
  { id: 'books-essay',        majorCategoryId: 'books',    name: 'エッセイ',         order: 6, isActive: true },
  // YouTube
  { id: 'yt-education',       majorCategoryId: 'youtube',  name: '解説・教育',       order: 1, isActive: true },
  { id: 'yt-vlog',            majorCategoryId: 'youtube',  name: 'Vlog',             order: 2, isActive: true },
  { id: 'yt-gaming',          majorCategoryId: 'youtube',  name: 'ゲーム実況',       order: 3, isActive: true },
  { id: 'yt-cooking',         majorCategoryId: 'youtube',  name: '料理',             order: 4, isActive: true },
  { id: 'yt-entertainment',   majorCategoryId: 'youtube',  name: 'エンタメ',         order: 5, isActive: true },
  // 映画
  { id: 'movies-action',      majorCategoryId: 'movies',   name: 'アクション',       order: 1, isActive: true },
  { id: 'movies-sf',          majorCategoryId: 'movies',   name: 'SF',               order: 2, isActive: true },
  { id: 'movies-drama',       majorCategoryId: 'movies',   name: 'ドラマ',           order: 3, isActive: true },
  { id: 'movies-anime',       majorCategoryId: 'movies',   name: 'アニメ映画',       order: 4, isActive: true },
  { id: 'movies-documentary', majorCategoryId: 'movies',   name: 'ドキュメンタリー', order: 5, isActive: true },
  // 音楽
  { id: 'music-jpop',         majorCategoryId: 'music',    name: 'J-POP',            order: 1, isActive: true },
  { id: 'music-rock',         majorCategoryId: 'music',    name: 'ロック',           order: 2, isActive: true },
  { id: 'music-classical',    majorCategoryId: 'music',    name: 'クラシック',       order: 3, isActive: true },
  { id: 'music-jazz',         majorCategoryId: 'music',    name: 'ジャズ',           order: 4, isActive: true },
  { id: 'music-anime',        majorCategoryId: 'music',    name: 'アニソン',         order: 5, isActive: true },
  // ゲーム
  { id: 'games-rpg',          majorCategoryId: 'games',    name: 'RPG',              order: 1, isActive: true },
  { id: 'games-action',       majorCategoryId: 'games',    name: 'アクション',       order: 2, isActive: true },
  { id: 'games-indie',        majorCategoryId: 'games',    name: 'インディー',       order: 3, isActive: true },
  { id: 'games-board',        majorCategoryId: 'games',    name: 'ボードゲーム',     order: 4, isActive: true },
];

// ─────────────────────────────────────────
// タグ（大カテゴリに依存しない横断タグ）
// ─────────────────────────────────────────
export const TAGS: Tag[] = [
  { id: 'mystery',    name: 'ミステリ',       order: 1,  isActive: true },
  { id: 'sf',         name: 'SF',             order: 2,  isActive: true },
  { id: 'horror',     name: 'ホラー',         order: 3,  isActive: true },
  { id: 'romance',    name: '恋愛',           order: 4,  isActive: true },
  { id: 'business',   name: 'ビジネス',       order: 5,  isActive: true },
  { id: 'selfhelp',   name: '自己啓発',       order: 6,  isActive: true },
  { id: 'cooking',    name: '料理',           order: 7,  isActive: true },
  { id: 'travel',     name: '旅行',           order: 8,  isActive: true },
  { id: 'tech',       name: 'テクノロジー',   order: 9,  isActive: true },
  { id: 'comedy',     name: 'コメディ',       order: 10, isActive: true },
  { id: 'documentary',name: 'ドキュメンタリー',order: 11,isActive: true },
  { id: 'anime',      name: 'アニメ',         order: 12, isActive: true },
  { id: 'indie',      name: 'インディー',     order: 13, isActive: true },
  { id: 'education',  name: '教育・解説',     order: 14, isActive: true },
  { id: 'vlog',       name: 'Vlog',           order: 15, isActive: true },
];

// ─────────────────────────────────────────
// ダミーユーザー
// ─────────────────────────────────────────
export const USERS: User[] = [
  { id: 'user-001', name: 'Taro Yamada',    avatarUrl: '👨‍💻' },
  { id: 'user-002', name: 'Hanako Suzuki',  avatarUrl: '👩‍🎨' },
  { id: 'user-003', name: 'Jiro Tanaka',    avatarUrl: '🎬' },
  { id: 'user-004', name: 'Yuki Nakamura',  avatarUrl: '📚' },
];

// ─────────────────────────────────────────
// ダミー投稿（大カテゴリ1つ + タグ複数の横断構造）
// ─────────────────────────────────────────
export const POSTS: Post[] = [
  {
    id: 'post-001',
    userId: 'user-001',
    user: USERS[0],
    majorCategoryId: 'youtube',
    subCategoryId: 'yt-education',
    tagIds: ['tech', 'education'],
    title: 'ゆる言語学ラジオ',
    description: '言語学をテーマにした解説チャンネル。「なぜこの言葉はこう聞こえるのか」という疑問を丁寧に解きほぐしていく構成が秀逸。話し手2人のテンポが心地よく、ながら聴きにも最適です。',
    url: 'https://www.youtube.com/@yurugengo',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likeCount: 15,
  },
  {
    id: 'post-002',
    userId: 'user-004',
    user: USERS[3],
    majorCategoryId: 'books',
    subCategoryId: 'books-essay',
    tagIds: ['mystery', 'anime'],
    title: '「火花」- 又吉直樹',
    url: 'https://www.shinchosha.co.jp/',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    likeCount: 8,
  },
  {
    id: 'post-003',
    userId: 'user-003',
    user: USERS[2],
    majorCategoryId: 'movies',
    subCategoryId: 'movies-sf',
    tagIds: ['sf', 'documentary'],
    title: 'インセプション',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    likeCount: 20,
  },
  {
    id: 'post-004',
    userId: 'user-001',
    user: USERS[0],
    majorCategoryId: 'apps',
    tagIds: ['tech'],
    title: 'Cursor（AIコードエディタ）',
    description: 'VSCodeベースのAI統合エディタ。プロンプト一つでコード生成・リファクタリングが可能。開発速度が劇的に上がりました。',
    url: 'https://www.cursor.com/',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likeCount: 30,
  },
  {
    id: 'post-005',
    userId: 'user-002',
    user: USERS[1],
    majorCategoryId: 'youtube',
    subCategoryId: 'yt-cooking',
    tagIds: ['cooking', 'vlog'],
    title: '料理研究家リュウジのバズレシピ',
    description: '再現性が高く、材料も手に入りやすい。毎回「そんな手があったか」と唸らされます。特に時短シリーズは平日の救世主。',
    url: 'https://www.youtube.com/@RyujiCooking',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    likeCount: 12,
  },
  {
    id: 'post-006',
    userId: 'user-002',
    user: USERS[1],
    majorCategoryId: 'books',
    subCategoryId: 'books-novel',
    tagIds: ['sf', 'mystery'],
    title: '「三体」- 劉慈欣',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    likeCount: 25,
  },
];
