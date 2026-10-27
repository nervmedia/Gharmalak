// Gharmalak Check: verified resident reviews for renters and buyers. Pune test, Wakad and Hinjewadi.
// Kept apart from the Nagpur club on purpose: Check pages never mention rounds or the club.

export const check = {
  city: 'Pune',
  areas: ['Wakad', 'Hinjewadi', 'Other'],
  prices: [99, 299] as const, // price test: each visitor sees one, picked at random
  minResidents: 3,
  hours: 24, // report promised within this many hours
  payoutAnswers: 150, // ₹ to a resident for a completed answer set
  payoutCall: 200, // ₹ for a 10-minute call
  paymentLinks: {
    99: process.env.NEXT_PUBLIC_CHECK_PAYMENT_LINK_99 || '',
    299: process.env.NEXT_PUBLIC_CHECK_PAYMENT_LINK_299 || '',
  } as Record<number, string>,
};

// Buildings with at least 3 verified residents. Add names here as residents are verified;
// they appear as suggestions in the search box and are marked "ready".
export const coveredBuildings: string[] = [];

export const questions = [
  { id: 'water', topic: 'Water', q: 'Is there a water shortage in summer? Do you use tanker water?' },
  { id: 'power', topic: 'Power', q: 'How often does the power go, and is there backup for lifts and flats?' },
  { id: 'maintenance', topic: 'Maintenance', q: 'What is the monthly maintenance charge, and is it worth it?' },
  { id: 'rules', topic: 'Rules for tenants', q: 'Any rules on bachelors, pets, food or guests?' },
  { id: 'security', topic: 'Security and parking', q: 'How are the guards, CCTV and visitor parking?' },
  { id: 'noise', topic: 'Noise and neighbours', q: 'Any construction nearby, loud events or traffic noise?' },
  { id: 'office', topic: 'Society office', q: 'When something breaks, does the society office get it fixed?' },
  { id: 'rent', topic: 'Real rent', q: 'What do 1, 2 and 3 BHK flats really rent for here?' },
  { id: 'deposit', topic: 'Deposit', q: 'How many months of deposit is normal, and do owners return it on time?' },
  { id: 'overall', topic: 'Overall', q: 'Would you recommend living here? Why or why not?' },
] as const;

export type QuestionId = (typeof questions)[number]['id'];
