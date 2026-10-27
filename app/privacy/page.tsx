import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = { title: 'Privacy' };

export default function Privacy() {
  return (
    <>
      <Header />
      <main id="main" className="page"><div className="wrap prose">
        <p className="overline">Gharmalak</p>
        <h1>Privacy</h1>
        <p>This page explains what we collect when you join Gharmalak and how we use it. It is a plain-language summary for the pilot; the full policy will be published before we leave Nagpur.</p>
        <h2>What we collect</h2>
        <p>Your name, WhatsApp number, area, type of home and the deals you are interested in. When you pay, our payment partner Razorpay shares the payment id and the mobile number used, so we can match it to you. We do not see or store your card or UPI details.</p>
        <p>We never ask for your Aadhaar number.</p>
        <h2>How we use it</h2>
        <p>To run your membership, to send you round updates on WhatsApp (at most 4 messages a month), and to share your name, number and area with the vendor who wins a round, only after you opt in to that round.</p>
        <h2>Where it is kept</h2>
        <p>On servers in India or with Indian data handling, for as long as you are a member and for up to 2 years after, unless the law asks us to keep it longer.</p>
        <h2>Your choices</h2>
        <p>Reply STOP on WhatsApp to stop messages. To see, correct or delete your data, message us on WhatsApp. We will reply within 7 days.</p>
        <p>We do not sell your data.</p>
      </div></main>
      <Footer />
    </>
  );
}
