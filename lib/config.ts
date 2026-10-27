export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gharmalak.in',
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, ''),
  paymentLink: process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK || '',
  fee: 499, // launch price until 31 Dec 2026
  regularFee: 999, // from 1 Jan 2027
  foundingSeats: 1000, // first Nagpur members whose fee comes off their first deal
};

export type Round = {
  id: string;
  slug: string;
  category: 'solar' | 'painting';
  city: string;
  opens: string; // ISO date
  closes: string; // ISO date
  target: number; // homes needed for a group price
  minSaving: number; // percent below the price to beat
};

// Round 1. Change dates here; everything else reads from this.
export const currentRound: Round = {
  id: 'r1-solar-nagpur',
  slug: 'solar-nagpur',
  category: 'solar',
  city: 'Nagpur',
  opens: '2026-11-18',
  closes: '2026-12-05',
  target: 50,
  minSaving: 10,
};

export const areas = [
  'Dharampeth', 'Ramdaspeth', 'Civil Lines', 'Manish Nagar', 'Wardha Road', 'Pratap Nagar',
  'Trimurti Nagar', 'Sadar', 'Hingna Road', 'Besa', 'Koradi Road', 'Kamptee Road', 'Other',
];

export function waLink(text: string) {
  const base = site.whatsapp ? `https://wa.me/${site.whatsapp}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function inr(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}
