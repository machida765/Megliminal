// types/index.ts（v2 - 横断タグ型対応）

export type MajorCategory = {
  id: string;        // 'youtube', 'books', 'movies'
  name: string;      // 'YouTube', '本・書籍', '映画'
  icon?: string;     // lucide-react のアイコン名
  order: number;     // 表示順（小さいほど上/左）
  isActive: boolean; // false のとき一般ユーザーに非表示
};

export type Tag = {
  id: string;        // 'mystery', 'sf', 'business'
  name: string;      // 'ミステリ', 'SF', 'ビジネス'
  order: number;
  isActive: boolean;
  // 大カテゴリへの依存なし → どの大カテゴリにも使える
};

export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Post = {
  id: string;
  userId: string;
  user: User;
  majorCategoryId: string; // 大カテゴリは必ず1つ
  tagIds: string[];         // タグは0個以上（横断可能）
  title: string;
  description: string;
  url?: string;
  createdAt: string;
  likeCount: number;
};
