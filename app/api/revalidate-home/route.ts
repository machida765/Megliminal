import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/** 投稿の追加・更新・削除のあと、トップの作り置き HTML を捨てる */
export async function POST() {
  revalidatePath('/', 'page');
  return NextResponse.json({ ok: true });
}
