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

let majorCategoriesCache: MajorCategory[] | null = null;
let majorCategoriesInflight: Promise<MajorCategory[]> | null = null;
let subCategoriesCache: SubCategory[] | null = null;
let subCategoriesInflight: Promise<SubCategory[]> | null = null;
let tagsCache: Tag[] | null = null;
let tagsInflight: Promise<Tag[]> | null = null;

async function loadMajorCategories(force = false): Promise<MajorCategory[]> {
  if (!force && majorCategoriesCache) return majorCategoriesCache;
  if (!force && majorCategoriesInflight) return majorCategoriesInflight;
  majorCategoriesInflight = getRepository()
    .getMajorCategories()
    .then((data) => {
      majorCategoriesCache = data;
      return data;
    })
    .finally(() => {
      majorCategoriesInflight = null;
    });
  return majorCategoriesInflight;
}

async function loadSubCategories(force = false): Promise<SubCategory[]> {
  if (!force && subCategoriesCache) return subCategoriesCache;
  if (!force && subCategoriesInflight) return subCategoriesInflight;
  subCategoriesInflight = getRepository()
    .getSubCategories()
    .then((data) => {
      subCategoriesCache = data;
      return data;
    })
    .finally(() => {
      subCategoriesInflight = null;
    });
  return subCategoriesInflight;
}

async function loadTags(force = false): Promise<Tag[]> {
  if (!force && tagsCache) return tagsCache;
  if (!force && tagsInflight) return tagsInflight;
  tagsInflight = getRepository()
    .getTags()
    .then((data) => {
      tagsCache = data;
      return data;
    })
    .finally(() => {
      tagsInflight = null;
    });
  return tagsInflight;
}

export function useMajorCategories(enabled = true) {
  const [categories, setCategories] = useState<MajorCategory[]>(
    () => majorCategoriesCache ?? []
  );
  const [loading, setLoading] = useState(
    () => enabled && majorCategoriesCache === null
  );

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await loadMajorCategories(true);
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(majorCategoriesCache === null);
    loadMajorCategories().then((data) => {
      if (!cancelled) {
        setCategories(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { categories, loading, reload };
}

export function useSubCategories(enabled = true) {
  const [subCategories, setSubCategories] = useState<SubCategory[]>(
    () => subCategoriesCache ?? []
  );
  const [loading, setLoading] = useState(
    () => enabled && subCategoriesCache === null
  );

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await loadSubCategories(true);
    setSubCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(subCategoriesCache === null);
    loadSubCategories().then((data) => {
      if (!cancelled) {
        setSubCategories(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { subCategories, loading, reload };
}

export function useTags(enabled = true) {
  const [tags, setTags] = useState<Tag[]>(() => tagsCache ?? []);
  const [loading, setLoading] = useState(
    () => enabled && tagsCache === null
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(tagsCache === null);
    loadTags().then((data) => {
      if (!cancelled) {
        setTags(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

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
