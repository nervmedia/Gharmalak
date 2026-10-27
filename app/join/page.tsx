import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JoinFlow } from './JoinFlow';

export const metadata: Metadata = { title: 'Join the club', description: 'Reserve your founding seat in Gharmalak, the Nagpur homeowners’ club. ₹499 a year.' };

export default function JoinPage() {
  return (
    <>
      <Header />
      <main id="main" className="page"><div className="wrap"><JoinFlow /></div></main>
      <Footer />
    </>
  );
}
