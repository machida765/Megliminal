'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import { getRepository } from '@/lib/data';

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAvatarUrl(profile.avatarUrl ?? '');
    }
  }, [profile]);

  if (!user || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-gray-500">
        ログインが必要です
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await getRepository().updateUser(user.id, {
        name,
        avatarUrl: avatarUrl || undefined,
      });
      await refreshProfile();
      alert('プロフィールを更新しました');
      router.push(`/profile/${user.id}`);
    } catch {
      alert('更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black mb-6 -rotate-1 inline-block hand-title">
        名前の書き換え
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">表示名</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                アバター（絵文字）
              </label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="例: 👨‍💻"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? '保存中...' : '保存する'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
