import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isDeskUser } from '@/lib/session';
import { cleanPhone, cleanText } from '@/lib/validate';

export async function POST(req: Request) {
  if (!(await isDeskUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const phone = cleanPhone(body.phone);
  if (!phone) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const ok = await db.markPaid(phone, cleanText(body.paymentId, 80) || null);
  return NextResponse.json({ ok });
}
