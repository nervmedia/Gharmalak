import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MyHomeView } from './MyHomeView';

export const metadata: Metadata = {
  title: 'My home reminders',
  description: 'Never miss a home bill or service again. Add your property tax, electricity, society maintenance, insurance and service dates, and Gharmalak reminds you on WhatsApp.',
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
