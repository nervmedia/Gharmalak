import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { cleanPhone, cleanText } from '@/lib/validate';
import { kindIds, repeats, type Repeat } from '@/lib/reminders';
import { ipOf, limited } from '@/lib/ratelimit';

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

// Save home reminders. Write-only: nothing is ever read back by phone number,
// so typing someone else's number shows nothing. The browser keeps the ids and
// a delete token so the owner can remove them from the same phone.
export async function POST(req: Request) {
  if (limited('rem:' + ipOf(req), 6)) return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const phone = cleanPhone(body.phone);
  const name = cleanText(body.name, 120);
  const remindDays = body.remindDays === 7 ? 7 : 3;
  const today = new Date().toISOString().slice(0, 10);
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, kindIds.length).filter((x: Record<string, unknown>) =>
    x && kindIds.includes(String(x.kind) as never) && /^\d{4}-\d{2}-\d{2}$/.test(String(x.dueDate)) && repeats.includes(String(x.repeat) as Repeat)
    && String(x.dueDate) >= '2000-01-01' && String(x.dueDate) <= '2099-12-31');
  if (!phone || name.length < 2 || !items.length || body.consent !== true) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  if (items.some((x: Record<string, unknown>) => x.repeat === 'none' && String(x.dueDate) < today)) {
    return NextResponse.json({ error: 'past_date' }, { status: 400 });
  }
  const reg = await db.getRegistration(phone);
  const token = randomBytes(24).toString('base64url');
  const tokenHash = hash(token);
  const createdAt = new Date().toISOString();
  const saved: { id: string; kind: string; dueDate: string; repeat: string }[] = [];
  for (const x of items as { kind: string; dueDate: string; repeat: string }[]) {
    const id = randomBytes(9).toString('base64url');
    await db.addReminder({ id, phone, name, kind: x.kind, dueDate: x.dueDate, repeat: x.repeat, remindDays, member: reg?.status === 'paid', tokenHash, createdAt });
    saved.push({ id, kind: x.kind, dueDate: x.dueDate, repeat: x.repeat });
  }
  return NextResponse.json({ ok: true, token, items: saved, member: reg?.status === 'paid' });
}

export async function DELETE(req: Request) {
  if (limited('remdel:' + ipOf(req), 30)) return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const id = cleanText(body.id, 24);
  const token = cleanText(body.token, 64);
  if (!id || !token) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const ok = await db.deleteReminder(id, hash(token));
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
