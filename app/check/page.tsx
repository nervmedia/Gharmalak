import type { Metadata } from 'next';
import { CheckHeader, CheckFooter } from '@/components/CheckShell';
import { CheckView } from './CheckView';

export const metadata: Metadata = {
  title: { absolute: 'Gharmalak Check · Talk to an owner before you buy' },
  description: 'Buying a flat in Wakad or Hinjewadi? Book a private 15-minute call with a verified owner in that building, or get written answers from 3 owners. No brokers, no builders, no paid reviews.',
};

export default function CheckPage() {
  return (
    <>
      <CheckHeader cta={{ href: '/check#search', label: 'Find an owner' }} />
      <main id="main"><CheckView /></main>
      <CheckFooter />
    </>
  );
}
