import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { cleanPhone, cleanText } from '@/lib/validate';
import { check, householdIds, questions } from '@/lib/check';
import { ipOf, limited } from '@/lib/ratelimit';

const YEARS = ['under-1', '1-3', '3-plus'];

export async function POST(req: Request) {
  if (limited('chk-ans:' + ipOf(req), 4)) return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const phone = cleanPhone(body.phone);
  const name = cleanText(body.name, 120);
  const building = cleanText(body.building, 120);
  const area = check.areas.includes(body.area) ? body.area : null;
  const years = YEARS.includes(body.years) ? body.years : null;
  const household = householdIds.includes(body.household) ? body.household : null;
  const rating = Math.round(Number(body.rating));
  const raw = body.answers && typeof body.answers === 'object' ? body.answers : {};
  const answers: Record<string, string> = {};
  for (const q of questions) answers[q.id] = cleanText(raw[q.id], 600);
  const filled = Object.values(answers).filter(a => a.length >= 2).length;
  if (!phone || name.length < 2 || building.length < 2 || !area || !years || !household || !(rating >= 1 && rating <= 5) || typeof body.recommend !== 'boolean' || filled < 8 || body.consent !== true) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const id = 'RES-' + randomBytes(4).toString('hex').toUpperCase();
  await db.addCheckAnswer({ id, phone, name, building, area, role: 'owner', years, household, answers, rating, recommend: body.recommend, calls: body.calls === true, status: 'pending', createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, id });
}
