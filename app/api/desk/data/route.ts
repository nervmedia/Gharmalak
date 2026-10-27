import { NextResponse } from 'next/server';
import { db, storageMode } from '@/lib/db';
import { currentRound } from '@/lib/config';
import { isDeskUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isDeskUser())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const [registrations, optins, counts] = await Promise.all([db.listRegistrations(), db.listOptins(currentRound.id), db.counts(currentRound.id)]);
  return NextResponse.json({ registrations, optins, counts, round: currentRound, storage: storageMode });
}
