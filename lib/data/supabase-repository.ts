import { createClient } from '@/lib/supabase/client';
import type {
  CreatePostInput,
  DataRepository,
  UpdatePostInput,
} from '@/lib/data/types';
import type { MajorCategory, Post, Profile, SubCategory, User } from '@/types';

function notReady(): never {
  throw new Error(
    'Supabase データソースは Phase 3 で接続します。画面開発中は NEXT_PUBLIC_DATA_SOURCE=local を使ってください。'
  );
}

/** Supabase 実装（Phase 3 で本実装。現時点はスキーマ確定前のプレースホルダ） */
export class SupabaseDataRepository implements DataRepository {
  private get client() {
    return createClient();
  }

  async getMajorCategories(): Promise<MajorCategory[]> {
    const { data, error } = await this.client
      .from('major_categories')
      .select('id, name, icon, sort_order, is_active')
      .order('sort_order');

    if (error) {
      console.warn('[supabase] getMajorCategories:', error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon ?? undefined,
      order: row.sort_order,
      isActive: row.is_active,
    }));
  }

  async getSubCategories(): Promise<SubCategory[]> {
    const { data, error } = await this.client
      .from('sub_categories')
      .select('id, major_category_id, name, sort_order, is_active')
      .order('sort_order');

    if (error) {
      console.warn('[supabase] getSubCategories:', error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      majorCategoryId: row.major_category_id,
      name: row.name,
      order: row.sort_order,
      isActive: row.is_active,
    }));
  }

  async getTags() {
    const { data, error } = await this.client
      .from('tags')
      .select('id, name, sort_order, is_active')
      .order('sort_order');

    if (error) {
      console.warn('[supabase] getTags:', error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      order: row.sort_order,
      isActive: row.is_active,
    }));
  }

  async getPosts(): Promise<Post[]> {
    notReady();
  }

  async getPost(): Promise<Post | null> {
    notReady();
  }

  async getPostsByUser(): Promise<Post[]> {
    notReady();
  }

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      avatarUrl: data.avatar_url ?? undefined,
    };
  }

  async getProfile(id: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, name, avatar_url, role, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      avatarUrl: data.avatar_url ?? undefined,
      role: data.role as Profile['role'],
      createdAt: data.created_at,
    };
  }

  async createPost(_input: CreatePostInput): Promise<Post> {
    notReady();
  }

  async updatePost(_id: string, _input: UpdatePostInput): Promise<Post> {
    notReady();
  }

  async deletePost(_id: string): Promise<void> {
    notReady();
  }

  async deletePosts(_ids: string[]): Promise<void> {
    notReady();
  }

  async checkPostFrequency(_userId: string, _majorCategoryId: string) {
    // Phase 3 で DB クエリに置き換え
    return { canPost: true };
  }

  async updateUser(id: string, data: Partial<Pick<User, 'name' | 'avatarUrl'>>) {
    const { data: updated, error } = await this.client
      .from('profiles')
      .update({
        name: data.name,
        avatar_url: data.avatarUrl,
      })
      .eq('id', id)
      .select('id, name, avatar_url')
      .single();

    if (error || !updated) throw error ?? new Error('Update failed');

    return {
      id: updated.id,
      name: updated.name,
      avatarUrl: updated.avatar_url ?? undefined,
    };
  }

  async upsertMajorCategory(): Promise<MajorCategory> {
    notReady();
  }

  async deleteMajorCategory(): Promise<void> {
    notReady();
  }

  async reorderMajorCategories(): Promise<MajorCategory[]> {
    notReady();
  }

  async getComments() {
    return [];
  }

  async getLikes() {
    return [];
  }

  async getPostRankings() {
    return [];
  }

  async getUserRankings() {
    return [];
  }

  async getBookmarks() {
    return [];
  }

  async isBookmarked() {
    return false;
  }

  async addBookmark() {
    notReady();
  }

  async removeBookmark() {
    notReady();
  }

  async reportPost() {
    notReady();
  }

  async hidePost() {
    notReady();
  }

  async unhidePost() {
    notReady();
  }

  async isPostHidden() {
    return false;
  }

  async getReports() {
    return [];
  }

  async resolveReports() {
    notReady();
  }
}

export const supabaseDataRepository = new SupabaseDataRepository();
