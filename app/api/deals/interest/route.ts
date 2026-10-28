import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanPhone, cleanText } from '@/lib/validate';
import { dealCities, dealIds } from '@/lib/deals';
import { ipOf, limited } from '@/lib/ratelimit';

// Free interest in a deal: no membership or payment needed. Lets us see which
// deal, city and ad brings people in before anyone pays.
export async function POST(req: Request) {
  if (limited('deal:' + ipOf(req), 12)) return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const phone = cleanPhone(body.phone);
  const name = cleanText(body.name, 120);
  const city = dealCities.includes(body.city) ? body.city : null;
  const ids: string[] = Array.isArray(body.deals) ? body.deals.filter((x: unknown) => dealIds.includes(String(x))).slice(0, dealIds.length) : [];
  const source = cleanText(body.source, 120) || 'direct';
  if (!phone || name.length < 2 || !city || !ids.length || body.consent !== true) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const reg = await db.getRegistration(phone);
  const createdAt = new Date().toISOString();
  let added = 0;
  for (const dealId of ids) {
    const { created } = await db.addDealInterest({ dealId, phone, name, city, source, member: reg?.status === 'paid', createdAt });
    if (created) added++;
  }
  return NextResponse.json({ ok: true, added, member: reg?.status === 'paid' });
}
