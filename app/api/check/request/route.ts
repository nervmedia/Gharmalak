import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { cleanPhone, cleanText } from '@/lib/validate';
import { check, householdIds } from '@/lib/check';
import { ipOf, limited } from '@/lib/ratelimit';

const MOVE_IN = ['this-month', 'next-month', 'later'];

export async function POST(req: Request) {
  if (limited('chk-req:' + ipOf(req))) return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const phone = cleanPhone(body.phone);
  const name = cleanText(body.name, 120);
  const building = cleanText(body.building, 120);
  const area = check.areas.includes(body.area) ? body.area : null;
  const purpose = body.purpose === 'buy' ? 'buy' : body.purpose === 'rent' ? 'rent' : null;
  const household = householdIds.includes(body.household) ? body.household : null;
  const moveIn = MOVE_IN.includes(body.moveIn) ? body.moveIn : null;
  const product = purpose === 'buy' && body.product === 'call' ? 'call' : 'report';
  const price = product === 'call' ? check.callPrice : check.prices.includes(Number(body.price) as 99 | 299) ? Number(body.price) : 299;
  const source = cleanText(body.source, 60) || 'direct';
  if (!phone || name.length < 2 || building.length < 2 || !area || !purpose || !household || !moveIn || body.consent !== true) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const id = 'CHK-' + randomBytes(4).toString('hex').toUpperCase();
  await db.addCheckRequest({ id, phone, name, building, area, purpose, product, household, moveIn, price, source, status: 'requested', createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, id });
}
