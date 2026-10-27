import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanPhone } from '@/lib/validate';
import { currentRound } from '@/lib/config';
import { ipOf, limited } from '@/lib/ratelimit';

export async function POST(req: Request) {
  if (limited('opt:' + ipOf(req))) return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const phone = cleanPhone(body.phone);
  if (!phone) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const reg = await db.getRegistration(phone);
  if (!reg) return NextResponse.json({ error: 'not_member' }, { status: 404 });
  const { created } = await db.addOptin({ roundId: currentRound.id, phone, createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, created, paid: reg.status === 'paid' });
}
