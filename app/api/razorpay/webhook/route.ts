import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { db } from '@/lib/db';
import { cleanPhone } from '@/lib/validate';
import { safeEqual } from '@/lib/session';

// Razorpay Dashboard > Webhooks: send payment.captured and payment_link.paid to /api/razorpay/webhook
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const raw = await req.text();
  const sig = req.headers.get('x-razorpay-signature') || '';
  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  if (!safeEqual(sig, expected)) return NextResponse.json({ error: 'bad_signature' }, { status: 401 });

  const evt = JSON.parse(raw);
  const payment = evt?.payload?.payment?.entity;
  if (!payment || payment.status !== 'captured' || Number(payment.amount) < 49900) return NextResponse.json({ ok: true, ignored: true });
  const phone = cleanPhone(payment.contact) || cleanPhone(payment.notes?.phone);
  if (!phone) return NextResponse.json({ ok: true, unmatched: true });
  const matched = await db.markPaid(phone, payment.id);
  return NextResponse.json({ ok: true, matched });
}
