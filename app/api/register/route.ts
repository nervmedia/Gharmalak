import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanPhone, cleanText } from '@/lib/validate';
import { areas } from '@/lib/config';
import { ipOf, limited } from '@/lib/ratelimit';

const INTERESTS = ['solar', 'painting', 'waterproofing', 'other'];

export async function POST(req: Request) {
  if (limited('reg:' + ipOf(req))) return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const phone = cleanPhone(body.phone);
  const name = cleanText(body.name, 120);
  const area = areas.includes(body.area) ? body.area : null;
  const home = body.home === 'flat' ? 'flat' : body.home === 'house' ? 'house' : null;
  const interests = Array.isArray(body.interests) ? body.interests.filter((i: string) => INTERESTS.includes(i)) : [];
  const lang = ['en', 'hi', 'mr'].includes(body.lang) ? body.lang : 'en';
  const source = cleanText(body.source, 60) || 'direct';
  if (!phone || name.length < 2 || !area || !home || body.consent !== true) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const { created } = await db.saveRegistration({
    phone, name, area, home, interests, lang, source,
    status: 'registered', paymentId: null, createdAt: new Date().toISOString(), paidAt: null,
  });
  const reg = await db.getRegistration(phone);
  return NextResponse.json({ ok: true, created, status: reg?.status ?? 'registered' });
}
