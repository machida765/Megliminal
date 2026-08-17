'use client';

import { useCallback, useEffect, useState } from 'react';
import { getRepository } from '@/lib/data';
import type {
  MajorCategory,
  Post,
  PostRankingEntry,
  Profile,
  RankingPeriod,
  Report,
  SubCategory,
  Tag,
  User,
  UserRankingEntry,
  UserRankingSort,
} from '@/types';

export function useMajorCategories() {
  const [categories, setCategories] = useState<MajorCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await getRepository().getMajorCategories();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { categories, loading, reload };
}

export function useSubCategories() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await getRepository().getSubCategories();
    setSubCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { subCategories, loading, reload };
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRepository()
      .getTags()
      .then(setTags)
      .finally(() => setLoading(false));
  }, []);

  return { tags, loading };
}

export function usePosts(viewerUserId?: string | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRepository().getPosts(viewerUserId ?? undefined);
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, [viewerUserId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { posts, loading, reload };
}

export function usePost(id: string, viewerUserId?: string | null) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getRepository().getPost(id, viewerUserId ?? undefined);
      setPost(data);
    } finally {
      setLoading(false);
    }
  }, [id, viewerUserId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { post, loading, reload };
}

export function useUser(id: string | null | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) {
      setUser(null);
      setLoading(false);
      return;
    }
    getRepository()
      .getUser(id)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [id]);

  return { user, loading };
}

export function useProfile(id: string | null | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const data = await getRepository().getProfile(id);
    setProfile(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { profile, loading, reload };
}

export function usePostsByUser(userId: string, viewerUserId?: string | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getRepository()
      .getPostsByUser(userId, viewerUserId ?? undefined)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [userId, viewerUserId]);

  return { posts, loading };
}

export function useBookmarks(userId: string | null | undefined) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));

  const reload = useCallback(async () => {
    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getRepository().getBookmarks(userId);
    setPosts(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { posts, loading, reload };
}

export function usePostRankings(
  period: RankingPeriod,
  categoryId?: string
) {
  const [entries, setEntries] = useState<PostRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRepository()
      .getPostRankings({ period, categoryId })
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [period, categoryId]);

  return { entries, loading };
}

export function useUserRankings(
  period: RankingPeriod,
  sortBy: UserRankingSort
) {
  const [entries, setEntries] = useState<UserRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRepository()
      .getUserRankings({ period, sortBy })
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [period, sortBy]);

  return { entries, loading };
}

export function useReports(status?: Report['status']) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await getRepository().getReports(status);
    setReports(data);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { reports, loading, reload };
}
