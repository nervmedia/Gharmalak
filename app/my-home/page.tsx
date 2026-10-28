import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MyHomeView } from './MyHomeView';

export const metadata: Metadata = {
  title: 'Home care reminders',
  description: 'Home care on time, at club rates. Gharmalak reminds you on WhatsApp when your AC service, RO filter, tank cleaning, pest control, leak check or inverter battery is due, with the club deal for the job.',
};

export default function MyHomePage() {
  return (
    <>
      <Header />
      <main id="main"><MyHomeView /></main>
      <Footer />
    </>
  );
}
