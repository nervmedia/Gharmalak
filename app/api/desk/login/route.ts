import { NextResponse } from 'next/server';
import { deskConfigured, safeEqual, startSession } from '@/lib/session';
import { ipOf, limited } from '@/lib/ratelimit';

export async function POST(req: Request) {
  if (limited('desk:' + ipOf(req), 5, 5 * 60_000)) return NextResponse.json({ error: 'too_many' }, { status: 429 });
  if (!deskConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const { password } = await req.json().catch(() => ({ password: '' }));
  if (!safeEqual(String(password || ''), process.env.DESK_PASSWORD as string)) return NextResponse.json({ error: 'wrong' }, { status: 401 });
  await startSession();
  return NextResponse.json({ ok: true });
}
