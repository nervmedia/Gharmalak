import { db } from '@/lib/db';
import { currentRound } from '@/lib/config';
import { isDeskUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

const cell = (v: unknown) => {
  const s = String(v ?? '');
  const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export async function GET() {
  if (!(await isDeskUser())) return new Response('Unauthorized', { status: 401 });
  const [regs, optins] = await Promise.all([db.listRegistrations(), db.listOptins(currentRound.id)]);
  const opted = new Set(optins.map(o => o.phone));
  const head = ['phone', 'name', 'area', 'home', 'interests', 'language', 'source', 'status', 'payment_id', 'joined', 'paid', 'round1_optin'];
  const rows = regs.map(r => [r.phone, r.name, r.area, r.home, r.interests.join(' '), r.lang, r.source, r.status, r.paymentId, r.createdAt, r.paidAt, opted.has(r.phone) ? 'yes' : 'no']);
  const csv = [head, ...rows].map(r => r.map(cell).join(',')).join('\n');
  return new Response('﻿' + csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="gharmalak-members-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
