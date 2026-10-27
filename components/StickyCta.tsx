'use client';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useLang } from './LangProvider';
import { waLink } from '@/lib/config';

export function StickyCta() {
  const { t } = useLang();
  return (
    <div className="sticky-cta">
      <Link href="/join" className="gm-btn gm-btn-primary">{t.hero_cta}</Link>
      <a href={waLink('Hi Gharmalak, I want to know more about the club.')} className="gm-btn gm-btn-whatsapp" aria-label={t.hero_wa} target="_blank" rel="noopener"><MessageCircle size={22} /></a>
    </div>
  );
}
