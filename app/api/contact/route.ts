import { NextResponse } from 'next/server';
import {
  contactClientIp,
  CONTACT_EMAIL_LIMIT,
  CONTACT_IP_LIMIT,
  CONTACT_RATE_WINDOW_MS,
  hashContactKey,
} from '@/lib/contact/rate-limit';
import {
  contactSubmissionSchema,
  isContactTrapTripped,
} from '@/lib/contact/schema';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const parsed = contactSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (isContactTrapTripped(parsed.data.contactTrap)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const admin = createAdminClient();
    const since = new Date(Date.now() - CONTACT_RATE_WINDOW_MS).toISOString();
    const ipHash = hashContactKey(contactClientIp(request));

    const [byEmail, byIp] = await Promise.all([
      admin
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('email', parsed.data.email)
        .gte('created_at', since),
      admin
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', since),
    ]);

    if (byEmail.error || byIp.error) {
      console.error('[contact] rate-limit', byEmail.error?.code ?? byIp.error?.code);
      return NextResponse.json({ error: 'unavailable' }, { status: 503 });
    }

    if ((byEmail.count ?? 0) >= CONTACT_EMAIL_LIMIT || (byIp.count ?? 0) >= CONTACT_IP_LIMIT) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId: string | null = null;
    if (user) {
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      userId = profile?.id ?? null;
    }

    const { error } = await admin.from('inquiries').insert({
      kind: parsed.data.kind,
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      user_id: userId,
      ip_hash: ipHash,
    });

    if (error) {
      console.error('[contact] insert', error.code);
      return NextResponse.json({ error: 'unavailable' }, { status: 503 });
    }
  } catch (error) {
    console.error('[contact]', error instanceof Error ? error.message : 'error');
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
