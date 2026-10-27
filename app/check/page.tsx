import type { Metadata } from 'next';
import { CheckHeader, CheckFooter } from '@/components/CheckShell';
import { CheckView } from './CheckView';

export const metadata: Metadata = {
  title: { absolute: 'Gharmalak Check · Know the building before you pay the deposit' },
  description: 'Honest answers about a Pune building from at least 3 verified residents, on WhatsApp within 24 hours. Wakad and Hinjewadi. No brokers, no builders, no paid reviews.',
};

export default function CheckPage() {
  return (
    <>
      <CheckHeader cta={{ href: '/check#search', label: 'Search a building' }} />
      <main id="main"><CheckView /></main>
      <CheckFooter />
    </>
  );
}
