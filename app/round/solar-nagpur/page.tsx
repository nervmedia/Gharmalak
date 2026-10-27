import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RoundView } from './RoundView';

export const metadata: Metadata = { title: 'Round 1: rooftop solar, Nagpur', description: 'Group deal on 3 kW rooftop solar for Nagpur homes. Ten local quotes set the price to beat; the winning bid must be at least 10% lower.' };

export default function RoundPage() {
  return (
    <>
      <Header />
      <main id="main" className="page"><div className="wrap"><RoundView /></div></main>
      <Footer />
    </>
  );
}
