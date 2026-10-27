import type { Metadata } from 'next';
import { isDeskUser, deskConfigured } from '@/lib/session';
import { DeskLogin, DeskView } from './DeskView';

export const metadata: Metadata = { title: 'Founder desk', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function DeskPage() {
  const ok = await isDeskUser();
  return ok ? <DeskView /> : <DeskLogin configured={deskConfigured()} />;
}
