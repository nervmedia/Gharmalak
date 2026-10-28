import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DealsView } from './DealsView';

export const metadata: Metadata = {
  title: 'Deals for the next 12 months',
  description: 'Browse free: every Gharmalak group deal for the next 12 months, from rooftop solar to festive painting. Tap the ones you want and we will WhatsApp you when each round opens.',
};

export default function DealsPage() {
  return (
    <>
      <Header />
      <main id="main"><DealsView /></main>
      <Footer />
    </>
  );
}
