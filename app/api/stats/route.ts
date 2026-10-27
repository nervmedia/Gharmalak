import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentRound } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const c = await db.counts(currentRound.id);
  return NextResponse.json({ members: c.members, optins: c.optins }, { headers: { 'Cache-Control': 'public, max-age=30' } });
}
