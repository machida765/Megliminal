import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  DELETE_ACCOUNT_CONFIRM_PHRASE,
  hasEmailPasswordIdentity,
} from '@/lib/auth/account';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmPhrase: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { password, confirmPhrase } = parsed.data;
  const requiresPassword = hasEmailPasswordIdentity(user);

  if (requiresPassword) {
    if (!password?.trim()) {
      return NextResponse.json({ error: 'password_required' }, { status: 400 });
    }

    if (!user.email) {
      return NextResponse.json({ error: 'invalid_account' }, { status: 400 });
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (verifyError) {
      return NextResponse.json({ error: 'invalid_password' }, { status: 403 });
    }
  } else if (confirmPhrase !== DELETE_ACCOUNT_CONFIRM_PHRASE) {
    return NextResponse.json({ error: 'confirm_phrase_required' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('[account/delete]', deleteError.message);
      return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('[account/delete]', error);
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
  }

  await supabase.auth.signOut({ scope: 'global' });

  return NextResponse.json({ success: true });
}
