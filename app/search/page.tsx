'use client';
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/PostCard';
import { MAJOR_CATEGORIES, TAGS, POSTS } from '@/data/dummy';
// Shadcn UIのSelectコンポーネントをインポート
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const filteredPosts = useMemo(() => {
    return POSTS.filter(post => {
      const matchesSearchTerm =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory ? post.majorCategoryId === selectedCategory : true;
      const matchesTag = selectedTag ? post.tagIds.includes(selectedTag) : true;

      return matchesSearchTerm && matchesCategory && matchesTag;
    });
  }, [searchTerm, selectedCategory, selectedTag]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">検索</h1>
      
      <div className="flex flex-col space-y-4 mb-8">
        {/* キーワード検索 */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="キーワードを入力..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>

        {/* カテゴリとタグのフィルター */}
        <div className="flex space-x-2">
          {/* カテゴリ選択 */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">すべてのカテゴリ</SelectItem>
              {MAJOR_CATEGORIES.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* タグ選択 */}
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="タグを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">すべてのタグ</SelectItem>
              {TAGS.map(tag => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            検索結果はありません
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
